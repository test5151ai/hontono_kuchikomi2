describe('スレッド機能テスト', () => {
  describe('スレッド作成 POST /api/threads', () => {
    it('管理者がスレッドを作成できる', async () => {
      // ... existing code ...
    });

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

    it('未認証ユーザーはスレッドを作成できない', async () => {
      const response = await request(app)
        .post('/api/threads')
        .send({
          title: '未認証ユーザーのスレッド',
          content: 'このスレッドは作成できないはずです',
          categoryId: 1
        });
      
      // 未認証ユーザーは401を返すべき
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', '認証が必要です');
    });
  });
}); 