// 投稿番号を修正するスクリプト
const { sequelize } = require('../models');

async function fixPostNumbers() {
  try {
    console.log('投稿番号修正スクリプトを開始...');

    // threads テーブルからすべてのスレッドIDを取得
    const [threads] = await sequelize.query(
      'SELECT id FROM threads'
    );

    console.log(`スレッドの総数: ${threads.length}`);

    // 各スレッドに対して処理を行う
    for (const thread of threads) {
      const threadId = thread.id;
      console.log(`スレッド ${threadId} の処理を開始...`);

      // スレッド内の投稿を作成日順で取得
      const [posts] = await sequelize.query(
        'SELECT id FROM posts WHERE "threadId" = ? ORDER BY "createdAt" ASC',
        { 
          replacements: [threadId]
        }
      );

      console.log(`  投稿数: ${posts.length}`);

      // 各投稿にpostNumberを割り当て (1から始まる連番)
      for (let i = 0; i < posts.length; i++) {
        const postId = posts[i].id;
        const postNumber = i + 1;

        await sequelize.query(
          'UPDATE posts SET "postNumber" = ? WHERE id = ?',
          {
            replacements: [postNumber, postId]
          }
        );
        console.log(`  投稿 ${postId} を ${postNumber} に更新`);
      }

      console.log(`スレッド ${threadId} の処理が完了`);
    }

    console.log('投稿番号の修正が完了しました');
    process.exit(0);
  } catch (error) {
    console.error('投稿番号修正中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトを実行
fixPostNumbers(); 