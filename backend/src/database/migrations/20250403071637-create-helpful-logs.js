'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('helpful_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      postId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true, // 非ログインユーザーの場合はnull
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: false
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

    // 同一投稿への重複投票を防ぐためのユニーク制約
    await queryInterface.addIndex('helpful_logs', ['postId', 'ipAddress', 'sessionId'], {
      unique: true,
      name: 'idx_helpful_logs_unique_vote'
    });

    // 検索用インデックス
    await queryInterface.addIndex('helpful_logs', ['postId'], {
      name: 'idx_helpful_logs_post_id'
    });
    await queryInterface.addIndex('helpful_logs', ['userId'], {
      name: 'idx_helpful_logs_user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('helpful_logs');
  }
};
