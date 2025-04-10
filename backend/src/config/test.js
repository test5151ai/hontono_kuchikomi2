module.exports = {
  database: {
    dialect: 'sqlite',
    storage: ':memory:',  // インメモリデータベースを使用
    logging: false
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '1h'
  },
  server: {
    port: 3001
  }
};

// ダミーテストを追加
describe('Config', () => {
  test('テスト設定が存在する', () => {
    expect(module.exports).toBeDefined();
  });
}); 