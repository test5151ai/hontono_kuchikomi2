'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('threads', 'categoryId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // カテゴリIDでの検索を高速化するためのインデックス
    await queryInterface.addIndex('threads', ['categoryId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('threads', 'categoryId');
  }
};
