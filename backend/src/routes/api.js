const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const postController = require('../controllers/postController');

// 投稿編集（管理者用）
router.put('/posts/:id', authenticateToken, isAdmin, postController.updatePost);

// 投稿削除（管理者用）
router.delete('/posts/:id', authenticateToken, isAdmin, postController.deletePost);

// 投稿に「参考になった」を追加
router.post('/posts/:id/helpful', postController.addHelpful);

module.exports = router; 