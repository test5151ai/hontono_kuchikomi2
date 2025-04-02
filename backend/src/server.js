require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.use('/api/auth', authRoutes);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// データベース接続とサーバー起動
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('データベース接続に成功しました');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('データベース接続に失敗しました:', error);
    process.exit(1);
  }
};

startServer(); 