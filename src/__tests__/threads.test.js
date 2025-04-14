test('未認証ユーザーはスレッドを作成できない', async () => {
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