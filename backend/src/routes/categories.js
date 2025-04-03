const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// カテゴリー一覧を取得
router.get('/', categoryController.getAllCategories);

// カテゴリー詳細を取得
router.get('/:id', categoryController.getCategoryById);

// カテゴリー別スレッド一覧を取得
router.get('/:id/threads', categoryController.getCategoryThreads);

module.exports = router; 