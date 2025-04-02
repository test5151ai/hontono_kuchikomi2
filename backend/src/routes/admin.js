const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdminRole } = require('../middleware/auth');
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserDetails,
  bulkApproveUsers
} = require('../controllers/admin');

// すべての管理者ルートに認証と管理者権限チェックを適用
router.use(authenticateToken, checkAdminRole);

// 承認待ちユーザー一覧の取得
router.get('/users/pending', getPendingUsers);

// ユーザー詳細情報の取得
router.get('/users/:id/details', getUserDetails);

// ユーザーの承認
router.put('/users/:id/approve', approveUser);

// ユーザーの拒否
router.put('/users/:id/reject', rejectUser);

// 一括承認
router.put('/users/bulk-approve', bulkApproveUsers);

module.exports = router; 