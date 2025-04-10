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
const createSuperUser = require('./seeders/superuser');

// カテゴリーのシードデータ
const categorySeeds = [
  {
    id: '9a4f3f31-4363-4554-be09-3cc6d94c788c',
    name: '銀行関連スレ',
    description: '銀行に関する情報や経験を共有する掲示板',
    slug: 'bank'
  },
  {
    id: 'baaa575d-4323-4246-9a50-c177c52d6648',
    name: '消費者金融スレ',
    description: '消費者金融に関する情報や経験を共有する掲示板',
    slug: 'consumer-finance'
  },
  {
    id: '843af8ed-4ea9-4508-9c73-27b949884d97',
    name: '街金スレ',
    description: '街金に関する情報や経験を共有する掲示板',
    slug: 'local-finance'
  },
  {
    id: 'f620c51e-1176-4522-8dce-48ec31b6640a',
    name: '個人融資スレ',
    description: '個人融資に関する情報や経験を共有する掲示板',
    slug: 'personal-loan'
  },
  {
    id: 'd5d7294c-a3dd-49f0-b9e4-9a34c2b56726',
    name: 'ファクタリングスレ',
    description: 'ファクタリングに関する情報や経験を共有する掲示板',
    slug: 'factoring'
  },
  {
    id: 'd0ede8d1-7fab-480b-8e82-bf643d580b50',
    name: '後払いスレ',
    description: '後払いサービスに関する情報や経験を共有する掲示板',
    slug: 'deferred-payment'
  },
  {
    id: 'fb17e2f1-2114-4e82-ba04-1263528ca256',
    name: '闇金スレ',
    description: '闇金に関する情報や被害経験を共有する掲示板',
    slug: 'illegal-finance'
  }
];

const app = express();

// サーバー起動時にカテゴリーデータを確認し、必要に応じて投入
async function ensureCategories() {
  try {
    const count = await Category.count();
    if (count === 0) {
      console.log('カテゴリーデータが存在しないため、シードデータを投入します...');
      await Category.bulkCreate(categorySeeds, {
        ignoreDuplicates: true // 重複を無視
      });
      console.log('カテゴリーデータの投入が完了しました');
    } else {
      console.log('カテゴリーデータは既に存在します');
    }
  } catch (error) {
    console.error('カテゴリーデータの確認/投入中にエラーが発生しました:', error);
  }
}

// サーバー起動時に基本データを初期化
async function initializeData() {
  try {
    // カテゴリーデータを確認・投入
    await ensureCategories();
    
    // スーパーユーザーを確認・作成
    await createSuperUser();
    console.log('基本データの初期化が完了しました');
  } catch (error) {
    console.error('基本データの初期化中にエラーが発生しました:', error);
  }
}

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