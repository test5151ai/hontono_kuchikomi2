require('dotenv').config();
const { sequelize, User } = require('./models');
const app = require('./app');
const bcrypt = require('bcrypt');

// データベース接続とサーバー起動
const PORT = process.env.PORT || 3000;

// スーパーユーザーの作成
const createSuperUser = async () => {
  try {
    const existingSuperUser = await User.findOne({
      where: { role: 'superuser' }
    });

    if (!existingSuperUser) {
      const hashedPassword = await bcrypt.hash(process.env.SUPERUSER_PASSWORD, 10);
      await User.create({
        username: process.env.SUPERUSER_USERNAME,
        email: process.env.SUPERUSER_EMAIL,
        password: hashedPassword,
        role: 'superuser',
        isApproved: true,
        isSuperAdmin: true
      });
      console.log('スーパーユーザーを作成しました');
    }
  } catch (error) {
    console.error('スーパーユーザーの作成に失敗しました:', error);
    throw error;
  }
};

async function startServer() {
  try {
    // データベース接続を確認
    await sequelize.authenticate();
    console.log('データベース接続に成功しました');

    // データベースを同期（強制的に再作成）
    await sequelize.sync({ force: true });
    console.log('データベースを同期しました');

    // スーパーユーザーの作成
    await createSuperUser();
    console.log('初期セットアップが完了しました');

    // サーバーを起動
    app.listen(PORT, () => {
      console.log(`サーバーが起動しました: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

startServer(); 