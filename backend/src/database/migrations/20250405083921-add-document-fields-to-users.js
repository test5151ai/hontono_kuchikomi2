'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'documentStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'not_submitted',
      validate: {
        isIn: [['not_submitted', 'submitted', 'approved', 'rejected']]
      }
    });

    await queryInterface.addColumn('users', 'documentSubmittedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'documentVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'documentVerifiedBy', {
      type: Sequelize.UUID,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'documentRejectReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'documentPath', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'documentStatus');
    await queryInterface.removeColumn('users', 'documentSubmittedAt');
    await queryInterface.removeColumn('users', 'documentVerifiedAt');
    await queryInterface.removeColumn('users', 'documentVerifiedBy');
    await queryInterface.removeColumn('users', 'documentRejectReason');
    await queryInterface.removeColumn('users', 'documentPath');
  }
};
