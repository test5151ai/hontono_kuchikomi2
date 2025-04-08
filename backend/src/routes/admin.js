const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin');
const categoryController = require('../controllers/admin/categories');
const userController = require('../controllers/admin/users');
const documentController = require('../controllers/admin/document');
const adminThreadsController = require('../controllers/admin/threads');

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
router.get('/users', authenticateToken, isAdmin, userController.getUsers);
router.get('/users/pending', authenticateToken, isAdmin, userController.getPendingUsers);
router.get('/users/:id', authenticateToken, isAdmin, userController.getUserDetails);
router.post('/users/:id/approve', authenticateToken, isAdmin, userController.approveUser);
router.post('/users/:id/reject', authenticateToken, isAdmin, userController.rejectUser);
router.post('/users/:id/suspend', authenticateToken, isAdmin, userController.suspendUser);
router.post('/users/bulk-approve', authenticateToken, isAdmin, userController.bulkApproveUsers);
router.post('/users/bulk-suspend', authenticateToken, isAdmin, userController.bulkSuspendUsers);
router.post('/users/export', authenticateToken, isAdmin, userController.exportUsers);
router.post('/users/:id/grant-admin', authenticateToken, isAdmin, userController.grantAdminRole);

// 書類管理
router.get('/users/:id/document', authenticateToken, isAdmin, documentController.getDocumentDetails);
router.post('/users/:id/document/approve', authenticateToken, isAdmin, documentController.approveDocument);
router.post('/users/:id/document/reject', authenticateToken, isAdmin, documentController.rejectDocument);

// ダッシュボード
router.get('/dashboard', authenticateToken, isAdmin, adminController.getDashboardStats);

// カテゴリー管理
router.get('/categories', authenticateToken, isAdmin, categoryController.getCategories);
router.post('/categories', authenticateToken, isAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticateToken, isAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticateToken, isAdmin, categoryController.deleteCategory);
router.post('/categories/:id/move-threads', authenticateToken, isAdmin, categoryController.moveThreadsToUncategorized);

// スレッド管理ルート
router.get('/threads', authenticateToken, isAdmin, adminThreadsController.getThreads);
router.post('/threads/check-duplicate', authenticateToken, isAdmin, adminThreadsController.checkDuplicateTitle);

module.exports = router; 