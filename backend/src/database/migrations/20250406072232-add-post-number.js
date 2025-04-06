'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // postNumberフィールドが既に存在するか確認
    const tableInfo = await queryInterface.describeTable('posts');
    
    // postNumberフィールドが存在しない場合のみ追加
    if (!tableInfo.postNumber) {
      await queryInterface.addColumn('posts', 'postNumber', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      });
    } else {
      // 既に存在する場合はフィールドタイプを修正
      await queryInterface.changeColumn('posts', 'postNumber', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      });
    }

    // 既存の投稿にpostNumberを付与（スレッドごとに1から順番に割り当て）
    const threads = await queryInterface.sequelize.query(
      'SELECT DISTINCT "threadId" FROM posts',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const thread of threads) {
      const threadId = thread.threadId;
      const posts = await queryInterface.sequelize.query(
        'SELECT id FROM posts WHERE "threadId" = ? ORDER BY "createdAt" ASC',
        { 
          replacements: [threadId],
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );

      // 各投稿にpostNumberを順番に設定
      for (let i = 0; i < posts.length; i++) {
        await queryInterface.sequelize.query(
          'UPDATE posts SET "postNumber" = ? WHERE id = ?',
          { 
            replacements: [i + 1, posts[i].id],
            type: queryInterface.sequelize.QueryTypes.UPDATE 
          }
        );
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'postNumber');
  }
};
