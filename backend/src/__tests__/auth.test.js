const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

describe('認証API テスト', () => {
  let testUser;

  beforeAll(async () => {
    // テスト用ユーザーの作成
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
  });

  afterAll(async () => {
    // テスト用ユーザーの削除
    if (testUser && testUser.id) {
      await User.destroy({ where: { id: testUser.id } });
    }
  });

  test('正しい認証情報でログインできる', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpass123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('username');
    expect(response.body.user).toHaveProperty('email');
  });

  test('不正な認証情報でログインできない', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'メールアドレスまたはパスワードが正しくありません。');
  });

  test('未承認ユーザーはログインできない', async () => {
    // 未承認ユーザーの作成
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const unapprovedUser = await User.create({
      id: uuidv4(),
      username: 'unapproved',
      email: 'unapproved@example.com',
      password: hashedPassword,
      role: 'user',
      isApproved: false,
      submission_method: 'email',
      submission_contact: 'unapproved@example.com'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unapproved@example.com',
        password: 'testpass123'
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'アカウントが承認されていません。管理者の承認をお待ちください。');

    // テスト用ユーザーの削除
    await User.destroy({ where: { id: unapprovedUser.id } });
  });
});