const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, rejectUser } = require('../controllers/admin');
const { isAdmin } = require('../middleware/admin');
const { authenticateToken } = require('../middleware/auth');

// 全てのルートで認証とAdmin権限チェックを行う
router.use(authenticateToken);
router.use(isAdmin);

// 承認待ちユーザー一覧の取得
router.get('/pending-users', getPendingUsers);

// ユーザーの承認
router.post('/users/:userId/approve', approveUser);

// ユーザーの承認拒否
router.post('/users/:userId/reject', rejectUser);

module.exports = router; 