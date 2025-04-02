const express = require('express');
const router = express.Router();
const { uploadScreenshot } = require('../controllers/upload');
const { authenticateToken } = require('../middleware/auth');
const { uploadScreenshot: uploadMiddleware } = require('../middleware/upload');

// 認証ミドルウェアを使用
router.use(authenticateToken);

// スクリーンショットのアップロード
router.post('/screenshot', uploadMiddleware.single('screenshot'), uploadScreenshot);

module.exports = router; 