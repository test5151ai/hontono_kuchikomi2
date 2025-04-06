const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');
const { authenticateAdmin } = require('../middleware/auth');

// スレッドを作成
router.post('/', threadController.createThread);

// スレッド詳細を取得
router.get('/:id', threadController.getThread);

// スレッドの投稿一覧を取得
router.get('/:id/posts', threadController.getThreadPosts);

// スレッドに投稿を追加
router.post('/:id/posts', threadController.createPost);

// 管理者用 - スレッドを編集
router.put('/:id', authenticateAdmin, threadController.updateThread);

// 管理者用 - スレッドを削除
router.delete('/:id', authenticateAdmin, threadController.deleteThread);

module.exports = router; 