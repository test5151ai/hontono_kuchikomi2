const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 8080;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// APIリクエストをバックエンドにプロキシ
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'  // /apiを保持する
    },
    onProxyReq: (proxyReq, req, res) => {
        // 認証トークンを追加
        const token = req.headers.authorization;
        if (token) {
            proxyReq.setHeader('Authorization', token);
        }
        
        console.log('=== プロキシリクエスト ===');
        console.log('Original URL:', req.url);
        console.log('Original Path:', req.path);
        console.log('Proxy Path:', proxyReq.path);
        console.log('Proxy Headers:', {
            'host': proxyReq.getHeader('host'),
            'origin': proxyReq.getHeader('origin'),
            'authorization': proxyReq.getHeader('authorization')
        });
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('=== プロキシレスポンス ===');
        console.log('Status:', proxyRes.statusCode);
        console.log('Headers:', {
            'content-type': proxyRes.headers['content-type'],
            'content-length': proxyRes.headers['content-length']
        });
    },
    onError: (err, req, res) => {
        console.error('=== プロキシエラー ===');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).send('プロキシエラーが発生しました');
    }
}));

// CSPヘッダーの設定
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:3000;"
    );
    next();
});

// ルートパスをindex.htmlにルーティング
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// aboutページのルート
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.listen(port, () => {
    console.log(`フロントエンドサーバーが起動しました: http://localhost:${port}`);
}); 