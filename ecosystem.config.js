module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'src/server.js',
      watch: ['src'],
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'server.js',
      watch: ['server.js', 'public'],
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}; 