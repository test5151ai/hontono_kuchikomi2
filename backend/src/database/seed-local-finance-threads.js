const { sequelize, Thread, Post, Category } = require('../models');

async function seedLocalFinanceThreads() {
  try {
    console.log('街金関連ダミースレッドの作成を開始します...');
    
    // カテゴリー一覧を取得
    const categories = await Category.findAll();
    if (categories.length === 0) {
      console.log('カテゴリーが見つかりません。先にカテゴリーを作成してください。');
      return;
    }
    
    // 街金カテゴリーを探す
    const localFinanceCategory = categories.find(category => category.slug === 'local-finance');
    if (!localFinanceCategory) {
      console.log('街金カテゴリーが見つかりません。先にカテゴリーを作成してください。');
      return;
    }
    
    // 街金関連のダミースレッド
    const localFinanceThread = {
      title: '街金の金利情報と体験談スレ',
      categoryId: localFinanceCategory.id,
      posts: [
        { content: '街金の金利情報や利用体験について情報交換するスレッドです。実際の体験談や金利の状況など共有しましょう。', postNumber: 1 },
        { content: '先日、都内の街金で30万円借りました。金利は18%でした。審査は当日完了しました。', postNumber: 2 },
        { content: '私は地方の街金で借りましたが、金利は20%でした。担保は不要で、身分証明書だけで借りられました。', postNumber: 3 },
        { content: '街金は便利ですが、返済計画はしっかり立てないと厳しいですね。計画的に利用すれば有用だと思います。', postNumber: 4 },
        { content: '私の知り合いは街金で借りて、返済が厳しくなってしまったようです。注意が必要ですね。', postNumber: 5 }
      ]
    };
    
    // トランザクションを開始
    await sequelize.transaction(async (t) => {
      console.log(`スレッド「${localFinanceThread.title}」を作成中...`);
      
      // スレッドを作成
      const thread = await Thread.create({
        title: localFinanceThread.title,
        categoryId: localFinanceThread.categoryId
      }, { transaction: t });
      
      // 投稿を作成
      for (const postData of localFinanceThread.posts) {
        await Post.create({
          content: postData.content,
          threadId: thread.id,
          postNumber: postData.postNumber
        }, { transaction: t });
      }
      
      console.log(`スレッド「${localFinanceThread.title}」を作成完了（投稿数: ${localFinanceThread.posts.length}）`);
    });
    
    console.log('街金関連ダミースレッドの作成が完了しました！');
    console.log('※ .envファイルのMAX_POSTS_PER_THREAD=5に設定されているため、6件目の投稿で次スレが自動作成されます。');
  } catch (error) {
    console.error('街金関連ダミースレッドの作成中にエラーが発生しました:', error);
  } finally {
    await sequelize.close();
  }
}

module.exports = seedLocalFinanceThreads; 