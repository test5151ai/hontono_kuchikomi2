const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

// 新規登録
router.post('/register', register);

// ログイン
router.post('/login', login);

// ログアウト（認証が必要）
router.post('/logout', authenticateToken, logout);

module.exports = router; 