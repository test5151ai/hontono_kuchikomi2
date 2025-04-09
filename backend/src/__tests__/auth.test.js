const request = require('supertest');
const app = require('../app');  // Express appのインスタンス
const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { User } = require('../models');

describe('認証API テスト', () => {
  beforeAll(async () => {
    // テストデータベースの準備
    await sequelize.sync({ force: true });
    
    // テストユーザーの作成
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      submissionContact: 'test-contact',
      status: 'active'
    });
  });

  afterAll(async () => {
    // データベース接続のクリーンアップ
    await sequelize.close();
  });

  describe('POST /api/login', () => {
    test('正しい認証情報でログインできる', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('誤った認証情報でログイン失敗', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/user/profile', () => {
    let authToken;

    beforeAll(async () => {
      // ログインしてトークンを取得
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });
      authToken = response.body.token;
    });

    test('認証済みユーザーがプロフィールを取得できる', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    test('認証なしでプロフィール取得に失敗', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });
  });
}); 