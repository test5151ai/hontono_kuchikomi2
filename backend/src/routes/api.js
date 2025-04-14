const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const postController = require('../controllers/postController');

// 投稿編集（管理者用）
router.put('/posts/:id', verifyToken, isAdmin, postController.updatePost);

// 投稿削除（管理者用）
router.delete('/posts/:id', verifyToken, isAdmin, postController.deletePost);

// 投稿に「参考になった」を追加
router.post('/posts/:id/helpful', postController.addHelpful);

module.exports = router; 