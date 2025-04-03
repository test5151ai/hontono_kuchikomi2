'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      threadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'threads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: true, // 匿名投稿を許可
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      authorName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '名無しさん' // 匿名投稿の場合のデフォルト名
      },
      helpfulCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // インデックスを追加
    await queryInterface.addIndex('posts', ['threadId']);
    await queryInterface.addIndex('posts', ['authorId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};
