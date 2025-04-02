const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserDetails,
  bulkApproveUsers
} = require('../controllers/admin');
const { isAdmin } = require('../middleware/admin');
const { authenticateToken } = require('../middleware/auth');

// 全てのルートで認証とAdmin権限チェックを行う
router.use(authenticateToken);
router.use(isAdmin);

// 承認待ちユーザー一覧の取得
router.get('/users/pending', getPendingUsers);

// ユーザー詳細情報の取得
router.get('/users/:id', getUserDetails);

// ユーザーの承認
router.put('/users/:id/approve', approveUser);

// ユーザーの拒否
router.put('/users/:id/reject', rejectUser);

// 一括承認
router.put('/users/bulk-approve', bulkApproveUsers);

module.exports = router; 