require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const app = require('./app');

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! 重要：このファイルのポート設定を変更しないでください      !!!
// !!! サーバーは既に正しく動作しています                        !!!
// !!! ポート3000を使用します - 変更しないでください            !!!
// !!! サーバーの再起動はユーザーが手動で行います               !!!
// !!! このファイルを実行しないでください - 既に実行中です       !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// 環境変数の設定
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// データベース接続とサーバー起動
const PORT = process.env.PORT || 3000;

// データベース接続とサーバー起動
const startServer = async () => {
    try {
        // データベース接続を確認
        await sequelize.authenticate();
        console.log('データベース接続に成功しました');

        // データベースを同期
        await sequelize.sync();
        console.log('データベースを同期しました');

        // サーバーを起動
        app.listen(PORT, () => {
            console.log(`サーバーがポート${PORT}で起動しました`);
            console.log(`- 管理画面: http://localhost:${PORT}/admin/`);
            console.log(`- API: http://localhost:${PORT}/api/`);
        });
    } catch (error) {
        console.error('サーバー起動中にエラーが発生しました:', error);
        process.exit(1);
    }
};

startServer(); 