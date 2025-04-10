const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('認証API テスト', () => {
  let authToken;

  beforeAll(async () => {
    // テストユーザーを作成
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      submissionContact: 'test-contact',
      status: 'active'
    });

    // テスト用の認証トークンを生成
    const user = await User.findOne({ where: { email: 'test@example.com' } });
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    authToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  describe('POST /api/auth/login', () => {
    test('正しい認証情報でログインできる', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('誤った認証情報でログイン失敗', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/check', () => {
    test('認証済みユーザーがプロフィールを取得できる', async () => {
      const response = await request(app)
        .get('/api/auth/check')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('id');
    });

    test('認証なしでプロフィール取得に失敗', async () => {
      const response = await request(app)
        .get('/api/auth/check');

      expect(response.status).toBe(401);
    });
  });
}); 