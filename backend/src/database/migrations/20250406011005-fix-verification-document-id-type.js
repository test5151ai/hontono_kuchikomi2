'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 既存のVerificationDocumentsテーブルをチェック
      const tableInfo = await queryInterface.describeTable('VerificationDocuments');
      
      // テーブルが存在する場合は削除
      if (tableInfo) {
        await queryInterface.dropTable('VerificationDocuments');
      }
    } catch (error) {
      console.log('テーブルはまだ存在しないか、別のエラーが発生しました：', error.message);
    }

    // UUIDタイプのIDで新しくテーブルを作成
    await queryInterface.createTable('VerificationDocuments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      documentPath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      documentType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'other'
      },
      documentName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verifiedBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      uploadedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
    await queryInterface.addIndex('VerificationDocuments', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VerificationDocuments');
  }
};
