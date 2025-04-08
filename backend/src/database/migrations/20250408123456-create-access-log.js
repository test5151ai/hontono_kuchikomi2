'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // まず既存のテーブルが存在するか確認して削除
      try {
        await queryInterface.dropTable('AccessLogs', { force: true });
        console.log('既存のAccessLogsテーブルを削除しました');
      } catch (err) {
        console.log('AccessLogsテーブルは存在しないため、削除をスキップします');
      }
      
      // テーブルを作成
      await queryInterface.createTable('AccessLogs', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        path: {
          type: Sequelize.STRING,
          allowNull: false
        },
        method: {
          type: Sequelize.STRING,
          allowNull: false
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        threadId: {
          type: Sequelize.UUID,
          allowNull: true
        },
        userAgent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        ip: {
          type: Sequelize.STRING,
          allowNull: true
        },
        referer: {
          type: Sequelize.STRING,
          allowNull: true
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
      
      // 一度に作成するのではなく、エラーを処理しながら個別に作成
      try {
        await queryInterface.addIndex('AccessLogs', ['createdAt'], { name: 'access_logs_created_at' });
      } catch (err) {
        console.log('createdAtのインデックスは既に存在します:', err.message);
      }
      
      try {
        await queryInterface.addIndex('AccessLogs', ['path'], { name: 'access_logs_path' });
      } catch (err) {
        console.log('pathのインデックスは既に存在します:', err.message);
      }
      
      try {
        await queryInterface.addIndex('AccessLogs', ['userId'], { name: 'access_logs_user_id' });
      } catch (err) {
        console.log('userIdのインデックスは既に存在します:', err.message);
      }
      
      try {
        await queryInterface.addIndex('AccessLogs', ['threadId'], { name: 'access_logs_thread_id' });
      } catch (err) {
        console.log('threadIdのインデックスは既に存在します:', err.message);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('マイグレーションに失敗しました:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AccessLogs');
  }
}; 