const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const { User, Thread, Category, Post } = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

describe('スレッドAPI テスト', () => {
  let testUser, adminUser, testCategory, testThread;
  let userToken, adminToken;

  beforeAll(async () => {
    // テストユーザーの作成
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    testUser = await User.create({
      id: uuidv4(),
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isApproved: true,
      submission_method: 'email',
      submission_contact: 'test@example.com'
    });

    adminUser = await User.create({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      submission_method: 'email',
      submission_contact: 'admin@example.com'
    });

    // カテゴリの作成
    testCategory = await Category.create({
      id: uuidv4(),
      name: 'テストカテゴリ',
      description: 'テスト用のカテゴリです',
      slug: 'test-category'
    });

    // トークンの取得
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpass123'
      });
    userToken = userResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'testpass123'
      });
    adminToken = adminResponse.body.token;

    // テストスレッドの作成
    testThread = await Thread.create({
      id: uuidv4(),
      title: 'テストスレッド',
      categoryId: testCategory.id,
      authorId: adminUser.id
    });
  });

  afterAll(async () => {
    // テストデータの削除
    await Post.destroy({ where: {} });
    await Thread.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  test('一般ユーザーはスレッドを作成できない', async () => {
    const response = await request(app)
      .post('/api/threads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: '新しいスレッド',
        categoryId: testCategory.id
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'スレッドの作成は管理者のみが行えます');
  });

  test('管理者はスレッドを作成できる', async () => {
    const response = await request(app)
      .post('/api/threads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '新しいスレッド',
        categoryId: testCategory.id
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('thread');
    expect(response.body.thread).toHaveProperty('id');
    expect(response.body.thread).toHaveProperty('title', '新しいスレッド');
  });

  test('スレッド一覧を取得できる', async () => {
    const response = await request(app)
      .get('/api/threads');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('threads');
    expect(Array.isArray(response.body.threads)).toBe(true);
  });

  test('スレッドの詳細を取得できる', async () => {
    const response = await request(app)
      .get(`/api/threads/${testThread.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('thread');
    expect(response.body.thread).toHaveProperty('id', testThread.id);
    expect(response.body.thread).toHaveProperty('title');
    expect(response.body.thread).toHaveProperty('categoryId');
    expect(response.body.thread).toHaveProperty('authorId');
  });
}); 