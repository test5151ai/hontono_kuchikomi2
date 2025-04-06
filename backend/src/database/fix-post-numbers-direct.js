const { sequelize } = require('../models');

async function fixPostNumbersDirect() {
    try {
        // データベース接続確認
        await sequelize.authenticate();
        console.log('データベース接続成功');
        
        // すべてのスレッドIDを取得
        const threads = await sequelize.query(
            `SELECT DISTINCT "threadId" FROM posts`,
            { type: sequelize.QueryTypes.SELECT, raw: true }
        );
        
        console.log('修正対象スレッド数:', threads.length);
        
        // 各スレッドの投稿を処理
        for (const thread of threads) {
            const threadId = thread.threadId;
            console.log(`スレッド ${threadId} の処理中...`);
            
            // スレッド内のすべての投稿を取得（作成日順）
            const posts = await sequelize.query(
                `SELECT id, "postNumber", "createdAt" FROM posts 
                 WHERE "threadId" = :threadId 
                 ORDER BY "createdAt" ASC`,
                { 
                    replacements: { threadId },
                    type: sequelize.QueryTypes.SELECT,
                    raw: true
                }
            );
            
            console.log(`スレッド ${threadId} の投稿数: ${posts.length}`);
            
            // 各投稿に連番を割り当て
            for (let i = 0; i < posts.length; i++) {
                const postId = posts[i].id;
                const newPostNumber = i + 1;
                const oldPostNumber = posts[i].postNumber;
                
                // 投稿番号を更新
                await sequelize.query(
                    `UPDATE posts SET "postNumber" = :newPostNumber WHERE id = :postId`,
                    {
                        replacements: { newPostNumber, postId },
                        type: sequelize.QueryTypes.UPDATE
                    }
                );
                
                console.log(`投稿 ${postId} の番号を ${oldPostNumber} から ${newPostNumber} に更新しました`);
            }
            
            console.log(`スレッド ${threadId} の処理が完了しました`);
        }
        
        console.log('すべてのスレッドの投稿番号修正が完了しました');
        
        // 確認のためすべての投稿を表示
        const allPosts = await sequelize.query(
            `SELECT id, "threadId", "postNumber", "createdAt" FROM posts ORDER BY "threadId", "postNumber"`,
            { type: sequelize.QueryTypes.SELECT, raw: true }
        );
        
        console.log('更新後の投稿一覧:');
        console.log(allPosts);
        
        await sequelize.close();
    } catch (error) {
        console.error('エラー発生:', error);
    }
}

fixPostNumbersDirect(); 