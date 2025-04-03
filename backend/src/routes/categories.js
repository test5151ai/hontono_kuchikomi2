const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');

// カテゴリー一覧を取得
router.get('/', categoryController.getCategories);

// カテゴリー詳細を取得
router.get('/:id', categoryController.getCategory);

// カテゴリー別スレッド一覧を取得
router.get('/:id/threads', categoryController.getCategoryThreads);

module.exports = router; 