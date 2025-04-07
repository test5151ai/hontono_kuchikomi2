const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
// コントローラーがまだ存在しないためコメントアウト
// const userController = require('../controllers/user');
const documentController = require('../controllers/user/document');
const profileController = require('../controllers/user/profile');
const documentUpload = require('../middleware/upload/document');

// ユーザー情報を取得
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'role', 'icon', 'isApproved', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        res.json(user);
    } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// プロフィール更新
router.put('/profile', authenticateToken, profileController.updateProfile);

// 書類管理ルート - 複数書類アップロード対応
router.post('/document/upload', authenticateToken, documentUpload, documentController.uploadDocument);
router.get('/document/status', authenticateToken, documentController.getDocumentStatus);
router.get('/document', authenticateToken, documentController.getDocuments);
router.delete('/document/:documentId', authenticateToken, documentController.deleteDocument);
router.delete('/document', authenticateToken, documentController.deleteAllDocuments);

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