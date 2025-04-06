const express = require('express');
const router = express.Router();
const { uploadDocument } = require('../../../middlewares/multer');
const documentController = require('../../../controllers/user/document');
const authMiddleware = require('../../../middlewares/auth');

// 認証が必要なルート
router.use(authMiddleware.verifyToken);

// 書類ステータスを取得
router.get('/status', documentController.getDocumentStatus);

// 書類一覧を取得
router.get('/', documentController.getDocuments);

// 書類をアップロード
router.post('/upload', uploadDocument.single('document'), documentController.uploadDocument);

// 特定の書類を削除
router.delete('/:documentId', documentController.deleteDocument);

// 全ての書類を削除（レガシー互換用）
router.delete('/', documentController.deleteAllDocuments);

module.exports = router; 