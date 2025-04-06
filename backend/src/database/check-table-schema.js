const { sequelize } = require('../models');

async function checkSchema() {
    try {
        // データベース接続確認
        await sequelize.authenticate();
        console.log('データベース接続成功');
        
        // posts テーブルのスキーマ情報を取得
        const [tableInfo] = await sequelize.query(
            `SELECT column_name, data_type, is_nullable, column_default
             FROM information_schema.columns
             WHERE table_name = 'posts'
             ORDER BY ordinal_position`,
            { type: sequelize.QueryTypes.SELECT, raw: true }
        );
        
        console.log('posts テーブル情報:');
        console.log(tableInfo);
        
        // posts テーブルの内容をサンプル取得
        const [posts] = await sequelize.query(
            `SELECT id, "postNumber", "threadId", "createdAt"
             FROM posts
             ORDER BY "threadId", "postNumber"
             LIMIT 10`,
            { type: sequelize.QueryTypes.SELECT, raw: true }
        );
        
        console.log('posts テーブルのサンプルデータ:');
        console.log(posts);
        
        await sequelize.close();
        console.log('データベース接続を閉じました');
    } catch (error) {
        console.error('エラー発生:', error);
    }
}

checkSchema(); 