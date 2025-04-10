'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // カテゴリーの初期データ
    const categorySeeds = [
      {
        id: '9a4f3f31-4363-4554-be09-3cc6d94c788c',
        name: '銀行関連スレ',
        description: '銀行に関する情報や経験を共有する掲示板',
        slug: 'bank',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'baaa575d-4323-4246-9a50-c177c52d6648',
        name: '消費者金融スレ',
        description: '消費者金融に関する情報や経験を共有する掲示板',
        slug: 'consumer-finance',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '843af8ed-4ea9-4508-9c73-27b949884d97',
        name: '街金スレ',
        description: '街金に関する情報や経験を共有する掲示板',
        slug: 'local-finance',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'f620c51e-1176-4522-8dce-48ec31b6640a',
        name: '個人融資スレ',
        description: '個人融資に関する情報や経験を共有する掲示板',
        slug: 'personal-loan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'd5d7294c-a3dd-49f0-b9e4-9a34c2b56726',
        name: 'ファクタリングスレ',
        description: 'ファクタリングに関する情報や経験を共有する掲示板',
        slug: 'factoring',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'd0ede8d1-7fab-480b-8e82-bf643d580b50',
        name: '後払いスレ',
        description: '後払いサービスに関する情報や経験を共有する掲示板',
        slug: 'deferred-payment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fb17e2f1-2114-4e82-ba04-1263528ca256',
        name: '闇金スレ',
        description: '闇金に関する情報や被害経験を共有する掲示板',
        slug: 'illegal-finance',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      // カテゴリーテーブルの既存データ数を確認
      const count = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM categories;',
        { type: Sequelize.QueryTypes.SELECT }
      ).then(result => parseInt(result[0].count, 10));
      
      // カテゴリーが存在しない場合のみ投入
      if (count === 0) {
        console.log('カテゴリーデータが存在しないため、シードデータを投入します...');
        await queryInterface.bulkInsert('categories', categorySeeds);
        console.log('カテゴリーデータの投入が完了しました');
      } else {
        console.log('カテゴリーデータは既に存在します');
      }
    } catch (error) {
      console.error('カテゴリーデータの確認/投入中にエラーが発生しました:', error);
      throw error; // マイグレーション失敗として扱う
    }
  },

  async down(queryInterface, Sequelize) {
    // ダウングレード時は何もしない（カテゴリーデータは削除しない）
    console.log('このマイグレーションに対するダウングレードは実装されていません（カテゴリーは保持されます）');
  }
};
