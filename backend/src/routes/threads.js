const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');

// スレッドを作成
router.post('/', threadController.createThread);

module.exports = router; 