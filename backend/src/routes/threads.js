const express = require('express');
const router = express.Router();
const threadController = require('../controllers/thread');
const authMiddleware = require('../middleware/auth');

// スレッド一覧を取得
router.get('/', threadController.getThreads);

// 人気スレッド一覧を取得
router.get('/popular', threadController.getPopularThreads);

// スレッドを作成
router.post('/', authMiddleware.verifyToken, authMiddleware.checkApproved, threadController.createThread);

// スレッド詳細を取得
router.get('/:id', threadController.getThread);

// スレッドの投稿一覧を取得
router.get('/:id/posts', threadController.getThreadPosts);

// スレッドに投稿を追加
router.post('/:id/posts', authMiddleware.verifyToken, authMiddleware.checkApproved, threadController.createPost);

// スレッドを更新
router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkApproved, threadController.updateThread);

// スレッドを削除
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkApproved, threadController.deleteThread);

// 管理者用 - スレッドの店舗情報を更新
router.put('/:id/shop-details', authMiddleware.verifyToken, authMiddleware.checkApproved, threadController.updateShopDetails);

// スレッドのコメントを取得
router.get('/:id/comments', threadController.getComments);

// スレッドにコメントを投稿
router.post('/:id/comments', authMiddleware.verifyToken, authMiddleware.checkApproved, threadController.createComment);

module.exports = router; 