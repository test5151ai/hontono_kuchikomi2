'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // postNumberカラムを追加
    await queryInterface.addColumn('posts', 'postNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    // すべてのスレッドを取得
    const threads = await queryInterface.sequelize.query(
      'SELECT id FROM threads',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 各スレッドの投稿に順番にpostNumberを設定
    for (const thread of threads) {
      const threadId = thread.id;
      
      // スレッド内の投稿を作成日順で取得
      const posts = await queryInterface.sequelize.query(
        'SELECT id FROM posts WHERE "threadId" = ? ORDER BY "createdAt" ASC',
        { 
          replacements: [threadId],
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );
      
      // 各投稿にpostNumberを設定
      for (let i = 0; i < posts.length; i++) {
        const postId = posts[i].id;
        const postNumber = i + 1; // 1から始まる連番
        
        await queryInterface.sequelize.query(
          'UPDATE posts SET "postNumber" = ? WHERE id = ?',
          { 
            replacements: [postNumber, postId],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // postNumberカラムをNOT NULL制約に変更
    await queryInterface.changeColumn('posts', 'postNumber', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // カラムを削除
    await queryInterface.removeColumn('posts', 'postNumber');
  }
};
