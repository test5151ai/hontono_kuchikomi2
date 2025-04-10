const { sequelize, Thread, Post, Category } = require('../models');

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! 重要: このファイルの内容を勝手に変更しないでください !!!
// !!! ユーザーから明示的な指示がない限り修正禁止         !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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
    
    // 街金関連のスレッド
    const localFinanceThreads = [
      {
        title: 'フクホーの口コミ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '全国どこにいても申し込みが可能で、信用情報がブラックでも融資してもらえたという声があります。', postNumber: 1 },
          { content: '収入が少なくても初回は9.9万円借りることができる点が評価されています。', postNumber: 2 },
          { content: '家族や知人に消費者金融を利用していることがバレたくない方におすすめです。', postNumber: 3 },
          { content: '審査に時間がかかり必要な時にお金が工面できなかったという不満もあります。', postNumber: 4 },
          { content: '利息は高めですが、計画的に返済できたという利用者の声もあります。', postNumber: 5 }
        ]
      },
      {
        title: 'エイワの口コミ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '審査が柔軟で、他の消費者金融では審査に通らなかった人でも融資が可能だったという報告があります。', postNumber: 1 },
          { content: '対面与信を採用しているため、AI診断に比べて柔軟な審査が可能です。', postNumber: 2 },
          { content: '金利が高いため、返済負担が増えることがあります。', postNumber: 3 },
          { content: '**「ここが最後の砦」**と感じる人も多く、他の金融機関で審査に落ちた人に人気です。', postNumber: 4 },
          { content: '店舗に行って申し込みが必要で、即日融資は難しい場合があります。', postNumber: 5 }
        ]
      },
      {
        title: 'セントラルの口コミ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: 'スピーディで丁寧な対応が評価されています。', postNumber: 1 },
          { content: '過去に債務整理をした人でも融資が可能だったという声があります。', postNumber: 2 },
          { content: '即日融資が可能で、希望額よりも多く融資してもらえたというケースもあります。', postNumber: 3 },
          { content: '店舗やスタッフによって対応がまちまちで、不満も見られます。', postNumber: 4 },
          { content: '返済期日までに資金の準備ができない場合、対応が悪いという意見もあります。', postNumber: 5 }
        ]
      },
      {
        title: 'アローの口コミ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '審査が最短45分で即日融資に対応しているため、急ぎでお金が必要な人におすすめです。', postNumber: 1 },
          { content: '借り換え専用ローンもあり、複数の借り入れを整理するのに便利です。', postNumber: 2 },
          { content: '**金利は年15.00%〜19.94%**で、最大借入額は200万円です。', postNumber: 3 },
          { content: '迅速な対応が評価されている一方で、金利が高めであるという意見もあります。', postNumber: 4 },
          { content: '具体的な口コミ情報は限られているため、他の金融機関と比較して評価が難しいです。', postNumber: 5 }
        ]
      }
    ];
    
    // トランザクションを開始
    await sequelize.transaction(async (t) => {
      // 各スレッドを作成
      for (const threadData of localFinanceThreads) {
        console.log(`スレッド「${threadData.title}」を作成中...`);
        
        // スレッドを作成
        const thread = await Thread.create({
          title: threadData.title,
          categoryId: threadData.categoryId
        }, { transaction: t });
        
        // 投稿を作成
        for (const postData of threadData.posts) {
          await Post.create({
            content: postData.content,
            threadId: thread.id,
            postNumber: postData.postNumber
          }, { transaction: t });
        }
        
        console.log(`スレッド「${threadData.title}」を作成完了（投稿数: ${threadData.posts.length}）`);
      }
    });
    
    console.log('街金関連スレッドの作成が完了しました！');
  } catch (error) {
    console.error('街金関連スレッドの作成中にエラーが発生しました:', error);
  }
  // データベース接続は閉じない（アプリケーション全体のDB接続を維持）
}

module.exports = seedLocalFinanceThreads; 