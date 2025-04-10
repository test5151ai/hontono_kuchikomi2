require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const createSuperUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('データベース接続に成功しました');

    // スーパーユーザーの存在確認
    const existingSuperUser = await User.findOne({
      where: {
        is_super_admin: true
      }
    });

    if (existingSuperUser) {
      console.log('スーパーユーザーは既に存在します');
      process.exit(0);
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(process.env.SUPERUSER_PASSWORD, 10);

    // スーパーユーザーの作成
    const superUser = await User.create({
      username: process.env.SUPERUSER_USERNAME,
      email: process.env.SUPERUSER_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      is_super_admin: true,
      submission_method: 'email',
      submission_contact: process.env.SUPERUSER_EMAIL
    });

    console.log('スーパーユーザーを作成しました:', {
      username: superUser.username,
      email: superUser.email,
      role: superUser.role
    });

    process.exit(0);
  } catch (error) {
    console.error('スーパーユーザーの作成に失敗しました:', error);
    process.exit(1);
  }
};

createSuperUser(); 