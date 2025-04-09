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