const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const { User, Thread, Category } = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

describe('スレッド機能テスト', () => {
  let userToken;
  let adminToken;
  let testCategoryId;

  beforeAll(async () => {
    // テストデータベースの準備
    await sequelize.sync({ force: true });
    
    // テスト用カテゴリーの作成
    const category = await Category.create({
      id: uuidv4(),
      name: 'テストカテゴリー',
      description: 'テスト用のカテゴリーです',
      slug: 'test-category'
    });
    testCategoryId = category.id;
    console.log('テスト用カテゴリーを作成しました:', { id: testCategoryId, name: category.name });
    
    // 一般ユーザーの作成
    const userPassword = await bcrypt.hash('userpass123', 10);
    await User.create({
      username: 'testuser',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      submissionContact: 'test-contact',
      status: 'active'
    });

    // 管理者ユーザーの作成
    const adminPassword = await bcrypt.hash('adminpass123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      submissionContact: 'admin-contact',
      status: 'active'
    });

    // トークンの取得
    const userResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'user@example.com',
        password: 'userpass123'
      });
    userToken = userResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpass123'
      });
    adminToken = adminResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('スレッド作成 POST /api/threads', () => {
    test('一般ユーザーがスレッドを作成できる（現状の動作）', async () => {
      const response = await request(app)
        .post('/api/threads')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'テストスレッド',
          content: 'これはテストスレッドです',
          categoryId: testCategoryId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('テストスレッド');
    });

    test('管理者がスレッドを作成できる', async () => {
      const response = await request(app)
        .post('/api/threads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '管理者のスレッド',
          content: '管理者が作成したスレッド',
          categoryId: testCategoryId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('管理者のスレッド');
    });

    test('未認証ユーザーはスレッドを作成できない', async () => {
      const response = await request(app)
        .post('/api/threads')
        .send({
          title: '未認証スレッド',
          content: 'これは作成されないはずです',
          categoryId: testCategoryId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('スレッド一覧取得 GET /api/threads', () => {
    test('スレッド一覧を取得できる', async () => {
      const response = await request(app)
        .get('/api/threads');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('スレッド詳細取得 GET /api/threads/:id', () => {
    let threadId;

    beforeAll(async () => {
      const thread = await Thread.findOne();
      threadId = thread ? thread.id : null;
    });

    test('存在するスレッドの詳細を取得できる', async () => {
      if (!threadId) {
        console.log('テスト用のスレッドが見つかりません');
        return;
      }

      const response = await request(app)
        .get(`/api/threads/${threadId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', threadId);
    });

    test('存在しないスレッドにアクセスすると404', async () => {
      const response = await request(app)
        .get(`/api/threads/${uuidv4()}`); // 存在しないUUIDを使用

      expect(response.status).toBe(404);
    });
  });
}); 