'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'submission_method', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'email'
    });
    
    await queryInterface.addColumn('users', 'submission_contact', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'submission_method');
    await queryInterface.removeColumn('users', 'submission_contact');
  }
};
