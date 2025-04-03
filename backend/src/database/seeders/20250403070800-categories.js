'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const categories = [
      {
        id: uuidv4(),
        name: '銀行関連スレ',
        description: '銀行に関する情報や経験を共有する掲示板',
        slug: 'bank',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '消費者金融スレ',
        description: '消費者金融に関する情報や経験を共有する掲示板',
        slug: 'consumer-finance',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '街金スレ',
        description: '街金に関する情報や経験を共有する掲示板',
        slug: 'local-finance',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '個人融資スレ',
        description: '個人融資に関する情報や経験を共有する掲示板',
        slug: 'personal-loan',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'ファクタリングスレ',
        description: 'ファクタリングに関する情報や経験を共有する掲示板',
        slug: 'factoring',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '後払いスレ',
        description: '後払いサービスに関する情報や経験を共有する掲示板',
        slug: 'deferred-payment',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '闇金スレ',
        description: '闇金に関する情報や被害経験を共有する掲示板',
        slug: 'illegal-finance',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('categories', categories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
}; 