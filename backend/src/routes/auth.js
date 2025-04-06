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

/**
 * 認証情報チェック
 */
router.get('/check', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      id: req.user.id,
      isAdmin: req.user.role === 'admin',
      isSuperuser: req.user.role === 'superuser'
    });
  } catch (error) {
    console.error('認証チェックエラー:', error);
    res.status(500).json({ success: false, message: '認証チェックに失敗しました' });
  }
});

module.exports = router; 