const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// ログイン
router.post('/login', authController.login);

// 新規登録
router.post('/register', authController.register);

// トークンリフレッシュ
router.post('/refresh', authController.refreshToken);

// ログアウト
router.post('/logout', authMiddleware.verifyToken, (req, res) => {
    res.json({ success: true, message: 'ログアウトしました' });
});

/**
 * 認証情報チェック
 */
router.get('/check', authMiddleware.verifyToken, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                isAdmin: req.user.isAdmin,
                isApproved: req.user.isApproved
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ success: false, message: '認証情報の確認中にエラーが発生しました' });
    }
});

module.exports = router; 