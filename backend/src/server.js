require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const app = require('./app');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// 環境変数の設定
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// データベース接続とサーバー起動
const PORT = process.env.PORT || 3000;

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

async function startServer() {
    try {
        // データベース接続を確認
        await sequelize.authenticate();
        console.log('データベース接続に成功しました');

        // データベースを同期
        await sequelize.sync();
        console.log('データベースを同期しました');

        // サーバーを起動
        app.listen(PORT, () => {
            console.log(`サーバーが起動しました: http://localhost:${PORT}`);
            console.log(`実行環境: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('サーバー起動エラー:', error);
        process.exit(1);
    }
}

startServer(); 