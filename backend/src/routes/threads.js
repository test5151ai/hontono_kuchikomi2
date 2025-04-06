const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');

// スレッドを作成
router.post('/', threadController.createThread);

// スレッド詳細を取得
router.get('/:id', threadController.getThread);

// スレッドの投稿一覧を取得
router.get('/:id/posts', threadController.getThreadPosts);

// スレッドに投稿を追加
router.post('/:id/posts', threadController.createPost);

module.exports = router; 