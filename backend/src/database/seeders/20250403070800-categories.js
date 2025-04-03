'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const categories = [
      {
        id: uuidv4(),
        name: '一般',
        description: '一般的な話題についての掲示板',
        slug: 'general',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '技術',
        description: '技術的な話題についての掲示板',
        slug: 'tech',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'エンターテイメント',
        description: '映画、音楽、ゲームなどのエンターテイメントについての掲示板',
        slug: 'entertainment',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'ニュース',
        description: '最新のニュースについての掲示板',
        slug: 'news',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '趣味',
        description: '趣味についての掲示板',
        slug: 'hobby',
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