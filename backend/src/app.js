const express = require('express');
const cors = require('cors');
const path = require('path');
const { Category } = require('./models');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const threadRoutes = require('./routes/threads');
const apiRoutes = require('./routes/api');
const accessLogger = require('./middleware/accessLogger');
const seedLocalFinanceThreads = require('./database/seed-local-finance-threads');

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! 重要：このファイルのポート設定を変更しないでください      !!!
// !!! サーバーは既に正しく動作しています                        !!!
// !!! ポート3000を使用します - 変更しないでください            !!!
// !!! サーバーの再起動はユーザーが手動で行います               !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const app = express();

// サーバー起動時に基本データを初期化
async function initializeData() {
  try {
    // テスト環境の場合、ログ出力を抑制
    const isTestEnv = process.env.NODE_ENV === 'test';
    const logInfo = isTestEnv ? () => {} : console.log;
    const logError = isTestEnv ? () => {} : console.error;
    
    // 開発環境の場合のみ、街金カテゴリーの初期スレッドを作成
    // カテゴリーとスーパーユーザーはマイグレーションで作成済みという前提
    if (process.env.NODE_ENV !== 'production') {
      try {
        await seedLocalFinanceThreads();
        logInfo('街金カテゴリーの初期スレッドを確認しました');
      } catch (error) {
        logError('街金カテゴリーの初期スレッド作成中にエラーが発生しました:', error);
        logInfo('街金カテゴリーの初期スレッド作成に失敗しましたが、処理を続行します');
      }
    }
    
    logInfo('基本データの初期化が完了しました');
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('基本データの初期化中にエラーが発生しました:', error);
    }
  }
}

// グローバル変数の初期化（レガシーコードとの互換性のため残す）
global.seedDataInitialized = false;
global.superUserInitialized = false;

// アプリケーション起動時に初期データを投入
initializeData();

// CORSの設定を最初に行う
const corsOptions = {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'https://15ch.net', 'http://15ch.net'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // プリフライトリクエストのキャッシュ時間（24時間）
};

// デバッグ用のリクエストログ
app.use((req, res, next) => {
    console.log('=== リクエスト情報 ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    console.log('Base URL:', req.baseUrl);
    console.log('Original URL:', req.originalUrl);
    console.log('Headers:', {
        'authorization': req.headers.authorization,
        'origin': req.headers.origin,
        'host': req.headers.host
    });
    next();
});

// CORSミドルウェアを最初に適用
app.use(cors(corsOptions));

// アクセスログミドルウェアを追加（認証後のリクエストを記録）
app.use('/api', accessLogger);

// Content Security Policyの設定
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' http://localhost:3000 http://localhost:8080 https://15ch.net; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com http://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com http://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com data:; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:3000 http://localhost:8080 https://15ch.net;"
    );
    next();
});

// プリフライトリクエストの処理
app.options('*', cors(corsOptions));

// その他のミドルウェア
app.use(express.json());

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api', apiRoutes);

// ルートのデバッグログ
app.use((req, res, next) => {
    console.log('=== ルーティング情報 ===');
    console.log('Matched Route:', req.route ? req.route.path : 'No route matched');
    console.log('Router Stack:', req.app._router.stack.map(layer => ({
        path: layer.route ? layer.route.path : 'middleware',
        method: layer.route ? layer.route.methods : 'middleware'
    })));
    next();
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

module.exports = app; 