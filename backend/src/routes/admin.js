const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin');
const categoryController = require('../controllers/admin/categories');

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
router.get('/users/pending', authenticateToken, isAdmin, adminController.getPendingUsers);
router.get('/users/:id', authenticateToken, isAdmin, adminController.getUserDetails);
router.post('/users/:id/approve', authenticateToken, isAdmin, adminController.approveUser);
router.post('/users/:id/reject', authenticateToken, isAdmin, adminController.rejectUser);
router.post('/users/bulk-approve', authenticateToken, isAdmin, adminController.bulkApproveUsers);
router.post('/users/:id/grant-admin', authenticateToken, isAdmin, adminController.grantAdminRole);

// ダッシュボード（ダミーデータを返す実装）
router.get('/dashboard', authenticateToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      pendingCount: 0,
      approvedCount: 0,
      recentUsers: []
    }
  });
});

// カテゴリー管理
router.get('/categories', authenticateToken, isAdmin, categoryController.getCategories);
router.post('/categories', authenticateToken, isAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticateToken, isAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticateToken, isAdmin, categoryController.deleteCategory);
router.post('/categories/:id/move-threads', authenticateToken, isAdmin, categoryController.moveThreadsToUncategorized);

module.exports = router; 