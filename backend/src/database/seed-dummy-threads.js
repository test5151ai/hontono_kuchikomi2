const { sequelize, Thread, Post, Category } = require('../models');

async function seedDummyThreads() {
  try {
    console.log('ダミースレッドの作成を開始します...');
    
    // カテゴリー一覧を取得
    const categories = await Category.findAll();
    if (categories.length === 0) {
      console.log('カテゴリーが見つかりません。先にカテゴリーを作成してください。');
      return;
    }
    
    // ダミースレッドのデータ
    const dummyThreads = [
      {
        title: '料理のおすすめレシピ',
        categoryId: categories[0].id,
        posts: [
          { content: '簡単においしく作れるレシピを共有しましょう！', postNumber: 1 },
          { content: '鶏むね肉の柔らかな唐揚げのレシピを教えてください。', postNumber: 2 },
          { content: '私は鶏むね肉を30分ほど塩麹に漬けると柔らかくなりますよ。', postNumber: 3 },
          { content: '塩麹ですか！試してみます。ありがとうございます。', postNumber: 4 },
          { content: '漬け込み時間は長くてもOKですか？一晩とかでも。', postNumber: 5 },
          { content: '一晩漬けるとさらに効果的です。ぜひお試しください。', postNumber: 6 },
          { content: '他にもおすすめの調味料ありますか？', postNumber: 7 },
        ]
      },
      {
        title: '最新のスマホ情報',
        categoryId: categories[0].id,
        posts: [
          { content: '新しく発売されたスマホの情報を共有しましょう！', postNumber: 1 },
          { content: 'iPhone 15の評判はどうですか？', postNumber: 2 },
          { content: 'カメラ性能がすごく良くなってますよ。特に夜景が綺麗に撮れます。', postNumber: 3 },
        ]
      },
      {
        title: '2024年おすすめの旅行先',
        categoryId: categories[0].id,
        posts: [
          { content: '今年おすすめの旅行先を教えてください！', postNumber: 1 },
          { content: '北海道の富良野がおすすめです。ラベンダーがきれいな季節ですよ。', postNumber: 2 },
          { content: '九州の屋久島も良いですよ。自然が豊かでリフレッシュできます。', postNumber: 3 },
          { content: '海外ならタイのプーケットが物価も安くておすすめです。', postNumber: 4 },
          { content: '沖縄の離島も静かで良いですよ。特に石垣島は星空がきれいです。', postNumber: 5 },
          { content: '京都も良いですね。夏は川床料理が楽しめます。', postNumber: 6 },
          { content: '伊豆半島の温泉も良いですよ。海の幸も美味しいです。', postNumber: 7 },
          { content: '長野の乗鞍高原で星空を見るのもおすすめです。', postNumber: 8 },
          { content: '富士山の近くの河口湖も景色が最高です。', postNumber: 9 },
          { content: '北アルプスでの登山も夏は気持ちいいですよ。', postNumber: 10 },
          { content: '奈良の吉野山は桜の季節が特に美しいです。', postNumber: 11 },
          { content: '四国のしまなみ海道をサイクリングするのもおすすめです。', postNumber: 12 },
        ]
      },
      {
        title: '在宅ワークのコツ',
        categoryId: categories[0].id,
        posts: [
          { content: '在宅ワークを効率的に進めるコツを共有しましょう！', postNumber: 1 },
          { content: '集中して作業するためにBGMを流すと効果的です。', postNumber: 2 },
        ]
      },
      {
        title: '健康的な食生活について',
        categoryId: categories[0].id,
        posts: [
          { content: '健康的な食生活についての情報交換をしましょう。', postNumber: 1 },
          { content: '朝食に野菜スムージーを取り入れています。おすすめですよ。', postNumber: 2 },
          { content: '玄米に変えたら消化が良くなりました。', postNumber: 3 },
          { content: '魚を週3回は食べるように心がけています。', postNumber: 4 },
        ]
      }
    ];
    
    // トランザクションを開始
    await sequelize.transaction(async (t) => {
      // 各ダミースレッドを作成
      for (const threadData of dummyThreads) {
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
    
    console.log('ダミースレッドの作成が完了しました！');
  } catch (error) {
    console.error('ダミースレッドの作成中にエラーが発生しました:', error);
  } finally {
    await sequelize.close();
  }
}

// スクリプトを実行
seedDummyThreads(); 