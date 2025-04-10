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
        title: 'フクホー情報スレ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '【店舗情報】\n公式サイトURL: https://fukufo.co.jp/\n\n紹介文: フクホーは大阪に拠点を置く老舗の消費者金融で、全国どこでも申し込みが可能です。他社での審査に通らなかった方にも融資のチャンスがあり、家族や知人に知られずに利用できる点が特徴です。', postNumber: 1 },
          { content: '全国どこにいても申し込みが可能で、信用情報がブラックでも融資してもらえたという声があります。', postNumber: 2 },
          { content: '収入が少なくても初回は9.9万円借りることができる点が評価されています。', postNumber: 3 },
          { content: '家族や知人に消費者金融を利用していることがバレたくない方におすすめです。', postNumber: 4 },
          { content: '審査に時間がかかり必要な時にお金が工面できなかったという不満もあります。', postNumber: 5 },
          { content: '利息は高めですが、計画的に返済できたという利用者の声もあります。', postNumber: 6 }
        ]
      },
      {
        title: 'エイワ情報スレ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '【店舗情報】\n公式サイトURL: https://www.eiwa.co.jp/\n\n紹介文: エイワは神奈川県横浜市に本社を置く消費者金融で、対面審査を実施しています。レディースローンや学生ローンなど、特定のニーズに応じた商品プランを提供しています。', postNumber: 1 },
          { content: '審査が柔軟で、他の消費者金融では審査に通らなかった人でも融資が可能だったという報告があります。', postNumber: 2 },
          { content: '対面与信を採用しているため、AI診断に比べて柔軟な審査が可能です。', postNumber: 3 },
          { content: '金利が高いため、返済負担が増えることがあります。', postNumber: 4 },
          { content: '**「ここが最後の砦」**と感じる人も多く、他の金融機関で審査に落ちた人に人気です。', postNumber: 5 },
          { content: '店舗に行って申し込みが必要で、即日融資は難しい場合があります。', postNumber: 6 }
        ]
      },
      {
        title: 'セントラル情報スレ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '【店舗情報】\n公式サイトURL: https://www.central-fc.co.jp/\n\n紹介文: セントラルは即日融資に対応する中小消費者金融で、独自の審査基準で融資を行っています。安心して利用できる正規のカードローン会社であり、即日融資が可能です。', postNumber: 1 },
          { content: 'スピーディで丁寧な対応が評価されています。', postNumber: 2 },
          { content: '過去に債務整理をした人でも融資が可能だったという声があります。', postNumber: 3 },
          { content: '即日融資が可能で、希望額よりも多く融資してもらえたというケースもあります。', postNumber: 4 },
          { content: '店舗やスタッフによって対応がまちまちで、不満も見られます。', postNumber: 5 },
          { content: '返済期日までに資金の準備ができない場合、対応が悪いという意見もあります。', postNumber: 6 }
        ]
      },
      {
        title: 'アロー情報スレ',
        categoryId: localFinanceCategory.id,
        posts: [
          { content: '【店舗情報】\n公式サイトURL: https://www.arrow-fc.co.jp/\n\n紹介文: アローは最短45分で審査が完了し、即日融資が可能な消費者金融です。現在の収入状況を重視するため、過去の信用情報が悪くても融資が可能な場合があります。', postNumber: 1 },
          { content: '審査が最短45分で即日融資に対応しているため、急ぎでお金が必要な人におすすめです。', postNumber: 2 },
          { content: '借り換え専用ローンもあり、複数の借り入れを整理するのに便利です。', postNumber: 3 },
          { content: '**金利は年15.00%〜19.94%**で、最大借入額は200万円です。', postNumber: 4 },
          { content: '迅速な対応が評価されている一方で、金利が高めであるという意見もあります。', postNumber: 5 },
          { content: '具体的な口コミ情報は限られているため、他の金融機関と比較して評価が難しいです。', postNumber: 6 }
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