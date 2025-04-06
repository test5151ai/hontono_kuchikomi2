'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
          model: 'Users',
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
        defaultValue: 'identity'
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