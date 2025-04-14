const request = require('supertest');
const app = require('../app');
const { adminToken, userToken } = require('./testUtils');

describe('スレッド機能テスト', () => {
  describe('スレッド作成 POST /api/threads', () => {
    it('管理者がスレッドを作成できる', async () => {
      const response = await request(app)
        .post('/api/threads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: 'test-category',
          title: 'テストスレッド',
          content: 'テストスレッドの内容'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeTruthy();
    });

    it('一般ユーザーはスレッド作成が制限される', async () => {
      const userToken = await loginUser(app);
      const response = await request(app)
        .post('/api/threads')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'テストスレッド',
          content: 'テスト内容',
          categoryId: 1
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBeTruthy();
    });

    it('未認証ユーザーはスレッドを作成できない', async () => {
      const response = await request(app)
        .post('/api/threads')
        .send({
          categoryId: 'test-category',
          title: 'テストスレッド',
          content: 'テストスレッドの内容'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', '認証が必要です');
    });
  });

  describe('スレッド作成依頼 POST /api/thread-requests', () => {
    it('一般ユーザーはスレッド作成を依頼できる', async () => {
      const response = await request(app)
        .post('/api/thread-requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          categoryId: 'test-category',
          title: 'テストスレッド依頼',
          content: 'テストスレッドの内容',
          reason: 'テストスレッドを作成したい理由'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeTruthy();
    });

    it('未認証ユーザーはスレッド作成を依頼できない', async () => {
      const response = await request(app)
        .post('/api/thread-requests')
        .send({
          categoryId: 'test-category',
          title: 'テストスレッド依頼',
          content: 'テストスレッドの内容',
          reason: 'テストスレッドを作成したい理由'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', '認証が必要です');
    });
  });

  describe('スレッド一覧取得 GET /api/threads', () => {
    it('スレッド一覧を取得できる', async () => {
      const response = await request(app).get('/api/threads');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.threads)).toBe(true);
    });
  });

  describe('スレッド詳細取得 GET /api/threads/:id', () => {
    it('存在するスレッドの詳細を取得できる', async () => {
      const response = await request(app).get('/api/threads/d6f9d03e-dbfa-4660-9579-4915573e9382');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('存在しないスレッドにアクセスすると404', async () => {
      const response = await request(app).get('/api/threads/30539af8-a280-41dc-ab02-a2eca2aa8ff4');
      expect(response.status).toBe(404);
    });
  });
}); 