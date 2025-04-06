'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('threads', 'shopUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('threads', 'shopDetails', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('threads', 'shopUrl');
    await queryInterface.removeColumn('threads', 'shopDetails');
  }
};
