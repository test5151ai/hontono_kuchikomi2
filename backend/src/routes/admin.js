const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin');
const categoryController = require('../controllers/admin/categories');
const userController = require('../controllers/admin/users');
const documentController = require('../controllers/admin/document');
const adminThreadsController = require('../controllers/admin/threads');
const analyticsController = require('../controllers/admin/analytics');
const authMiddleware = require('../middleware/auth');

// デバッグ用のログ出力
console.log('admin.js ルートファイルの読み込み開始');

// isAdminミドルウェアの状態を確認（認証エラーの原因特定に必要）
console.log('isAdmin ミドルウェアの状態:', {
  type: typeof isAdmin,
  isFunction: typeof isAdmin === 'function'
});

// adminControllerの構造確認
console.log('adminController の構造:', {
  type: typeof adminController,
  isObject: adminController instanceof Object,
  ownProperties: Object.getOwnPropertyNames(adminController)
});

// 各関数の状態確認
const functionNames = ['getPendingUsers', 'getUserDetails', 'approveUser', 'rejectUser', 'bulkApproveUsers', 'getDashboardStats', 'grantAdminRole'];
functionNames.forEach(name => {
  console.log(`${name} の状態:`, {
    exists: name in adminController,
    type: typeof adminController[name],
    isFunction: typeof adminController[name] === 'function'
  });
});

// ユーザー管理
router.get('/users', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getPendingUsers);
router.get('/users/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getUserDetails);
router.post('/users/:id/approve', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.approveUser);
router.post('/users/:id/reject', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.rejectUser);
router.post('/users/:id/suspend', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.suspendUser);
router.post('/users/bulk-approve', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.bulkApproveUsers);
router.post('/users/bulk-suspend', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.bulkSuspendUsers);
router.post('/users/export', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.exportUsers);
router.post('/users/:id/grant-admin', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.grantAdminRole);

// 新規管理者作成エンドポイント（スーパーユーザーのみ実行可能）
router.post('/users/create-admin', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.createAdmin);

// 書類管理
router.get('/users/:id/document', authMiddleware.verifyToken, authMiddleware.isAdmin, documentController.getDocumentDetails);
router.post('/users/:id/document/approve', authMiddleware.verifyToken, authMiddleware.isAdmin, documentController.approveDocument);
router.post('/users/:id/document/reject', authMiddleware.verifyToken, authMiddleware.isAdmin, documentController.rejectDocument);

// ダッシュボード
router.get('/stats', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getDashboardStats);

// アクセス統計
router.get('/analytics/monthly', authMiddleware.verifyToken, authMiddleware.isAdmin, analyticsController.getMonthlyAccessStats);
router.get('/analytics/popular-threads', authMiddleware.verifyToken, authMiddleware.isAdmin, analyticsController.getPopularThreads);

// カテゴリー管理
router.get('/categories', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.getCategories);
router.post('/categories', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.createCategory);
router.put('/categories/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.deleteCategory);
router.post('/categories/:id/move-threads', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.moveThreadsToUncategorized);

// スレッド管理ルート
router.get('/threads', authMiddleware.verifyToken, authMiddleware.isAdmin, adminThreadsController.getThreads);
router.post('/threads/check-duplicate', authMiddleware.verifyToken, authMiddleware.isAdmin, adminThreadsController.checkDuplicateTitle);

module.exports = router; 