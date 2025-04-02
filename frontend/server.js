const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ルートパスを管理者ダッシュボードにリダイレクト
app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.listen(port, () => {
    console.log(`フロントエンドサーバーが起動しました: http://localhost:${port}`);
}); 