'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'documentStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'not_submitted',
      validate: {
        isIn: [['not_submitted', 'submitted', 'approved', 'rejected']]
      }
    });

    await queryInterface.addColumn('Users', 'documentSubmittedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'documentVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'documentVerifiedBy', {
      type: Sequelize.UUID,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'documentRejectReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'documentPath', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'documentStatus');
    await queryInterface.removeColumn('Users', 'documentSubmittedAt');
    await queryInterface.removeColumn('Users', 'documentVerifiedAt');
    await queryInterface.removeColumn('Users', 'documentVerifiedBy');
    await queryInterface.removeColumn('Users', 'documentRejectReason');
    await queryInterface.removeColumn('Users', 'documentPath');
  }
};
