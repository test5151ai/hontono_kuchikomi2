const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

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