const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');
// コントローラーがまだ存在しないためコメントアウト
// const userController = require('../controllers/user');
const documentController = require('../controllers/user/document');
const profileController = require('../controllers/user/profile');
const documentUpload = require('../middleware/upload/document');

// ユーザー情報を取得
router.get('/me', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'name', 'role', 'isApproved', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isApproved: user.isApproved,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('User info error:', error);
        res.status(500).json({
            success: false,
            message: 'ユーザー情報の取得中にエラーが発生しました'
        });
    }
});

// プロフィール更新
router.put('/profile', authMiddleware.verifyToken, profileController.updateProfile);

// 書類管理ルート - 複数書類アップロード対応
router.post('/document/upload', authMiddleware.verifyToken, documentUpload, documentController.uploadDocument);
router.get('/document/status', authMiddleware.verifyToken, documentController.getDocumentStatus);
router.get('/document', authMiddleware.verifyToken, documentController.getDocuments);
router.delete('/document/:documentId', authMiddleware.verifyToken, documentController.deleteDocument);
router.delete('/document', authMiddleware.verifyToken, documentController.deleteAllDocuments);

// 投稿履歴取得は一時的に無効化
// router.get('/me/posts', authenticateToken, async (req, res) => {
//     try {
//         const posts = await Post.findAll({
//             where: { userId: req.user.id },
//             order: [['createdAt', 'DESC']],
//             attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt']
//         });

//         res.json(posts);
//     } catch (error) {
//         console.error('投稿履歴取得エラー:', error);
//         res.status(500).json({ message: 'サーバーエラーが発生しました' });
//     }
// });

module.exports = router; 