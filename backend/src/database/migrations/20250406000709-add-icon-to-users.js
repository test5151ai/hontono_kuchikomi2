'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'icon', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'fas fa-user'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'icon');
  }
};
