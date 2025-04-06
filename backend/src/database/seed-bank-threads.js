const { sequelize, Thread, Post, Category } = require('../models');

async function seedBankThreads() {
  try {
    console.log('銀行審査関連ダミースレッドの作成を開始します...');
    
    // カテゴリー一覧を取得
    const categories = await Category.findAll();
    if (categories.length === 0) {
      console.log('カテゴリーが見つかりません。先にカテゴリーを作成してください。');
      return;
    }
    
    // 銀行審査関連のダミースレッド
    const bankThread = {
      title: 'A銀行カードローン審査情報スレ',
      categoryId: categories[0].id,
      posts: [
        { content: 'A銀行のカードローン審査について情報交換するスレッドです。審査の厳しさや期間など、体験談を共有しましょう。', postNumber: 1 },
        { content: '先日申し込みしました。年収400万、正社員で申し込みましたが審査通りました。2日で結果出ました。', postNumber: 2 },
        { content: '自分は年収350万、派遣社員ですが無事通りましたよ。ただ限度額は50万円でした。審査期間は3日でした。', postNumber: 3 },
        { content: '過去に他社で延滞があるとやはり厳しいでしょうか？経験ある方いますか？', postNumber: 4 },
        { content: '3年前の延滞なら大丈夫だと思います。自分は2年前の延滞で無事通りました。ただ限度額は低めでした。', postNumber: 5 }
      ]
    };
    
    // トランザクションを開始
    await sequelize.transaction(async (t) => {
      console.log(`スレッド「${bankThread.title}」を作成中...`);
      
      // スレッドを作成
      const thread = await Thread.create({
        title: bankThread.title,
        categoryId: bankThread.categoryId
      }, { transaction: t });
      
      // 投稿を作成
      for (const postData of bankThread.posts) {
        await Post.create({
          content: postData.content,
          threadId: thread.id,
          postNumber: postData.postNumber
        }, { transaction: t });
      }
      
      console.log(`スレッド「${bankThread.title}」を作成完了（投稿数: ${bankThread.posts.length}）`);
    });
    
    console.log('銀行審査関連ダミースレッドの作成が完了しました！');
    console.log('※ .envファイルのMAX_POSTS_PER_THREAD=5に設定されているため、6件目の投稿で次スレが自動作成されます。');
  } catch (error) {
    console.error('銀行審査関連ダミースレッドの作成中にエラーが発生しました:', error);
  } finally {
    await sequelize.close();
  }
}

// スクリプトを実行
seedBankThreads(); 