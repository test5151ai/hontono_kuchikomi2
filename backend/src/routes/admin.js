const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  getApprovedUsers,
  approveUser,
  rejectUser,
  getDashboardStats,
  grantAdminRole
} = require('../controllers/admin');
const { isAdmin } = require('../middleware/admin');
const { authenticateToken } = require('../middleware/auth');

// 全てのルートで認証とAdmin権限チェックを行う
router.use(authenticateToken);
router.use(isAdmin);

// ダッシュボード情報の取得
router.get('/dashboard', getDashboardStats);

// 承認待ちユーザー一覧の取得
router.get('/pending-users', getPendingUsers);

// 承認済みユーザー一覧の取得
router.get('/approved-users', getApprovedUsers);

// ユーザーの承認
router.post('/users/:userId/approve', approveUser);

// ユーザーの承認拒否
router.post('/users/:userId/reject', rejectUser);

// 管理者権限の付与（スーパーユーザーのみ可能）
router.post('/users/:userId/grant-admin', grantAdminRole);

module.exports = router; 