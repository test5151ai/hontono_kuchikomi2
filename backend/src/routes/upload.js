const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadScreenshot } = require('../controllers/upload');
const authMiddleware = require('../middleware/auth');

// アップロード用のmulter設定
const uploadMiddleware = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// スクリーンショットのアップロード
router.post('/screenshot', 
    authMiddleware.verifyToken,
    uploadMiddleware.single('screenshot'),
    uploadScreenshot
);

module.exports = router; 