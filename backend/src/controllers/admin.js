const { User } = require('../models');
const { Op } = require('sequelize');

// 承認待ちユーザー一覧の取得
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isApproved: false,
        role: 'user'
      },
      attributes: ['id', 'username', 'email', 'createdAt', 'approvalScreenshot']
    });

    res.json({
      message: '承認待ちユーザー一覧を取得しました',
      users
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: '承認待ちユーザー一覧の取得に失敗しました' });
  }
};

// 承認済みユーザー一覧の取得
const getApprovedUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isApproved: true,
        role: 'user'
      },
      attributes: ['id', 'username', 'email', 'createdAt', 'approvedAt']
    });

    res.json({
      message: '承認済みユーザー一覧を取得しました',
      users
    });
  } catch (error) {
    console.error('Get approved users error:', error);
    res.status(500).json({ error: '承認済みユーザー一覧の取得に失敗しました' });
  }
};

// ユーザーの承認
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    if (user.isApproved) {
      return res.status(400).json({ error: 'このユーザーは既に承認されています' });
    }

    await user.update({
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: adminId
    });

    res.json({
      message: 'ユーザーを承認しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isApproved: user.isApproved,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'ユーザーの承認に失敗しました' });
  }
};

// ユーザーの承認拒否
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    if (user.isApproved) {
      return res.status(400).json({ error: 'このユーザーは既に承認されています' });
    }

    // ユーザーを削除
    await user.destroy();

    res.json({
      message: 'ユーザーの承認を拒否しました',
      userId,
      reason
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'ユーザーの承認拒否に失敗しました' });
  }
};

// 管理者ダッシュボード用の統計情報
const getDashboardStats = async (req, res) => {
  try {
    const [pendingCount, approvedCount] = await Promise.all([
      User.count({ where: { isApproved: false, role: 'user' } }),
      User.count({ where: { isApproved: true, role: 'user' } })
    ]);

    const recentUsers = await User.findAll({
      where: { role: 'user' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'username', 'email', 'createdAt', 'isApproved']
    });

    res.json({
      message: 'ダッシュボード情報を取得しました',
      stats: {
        pendingUsers: pendingCount,
        approvedUsers: approvedCount,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'ダッシュボード情報の取得に失敗しました' });
  }
};

// 管理者権限の付与（スーパーユーザーのみ可能）
const grantAdminRole = async (req, res) => {
  try {
    // スーパーユーザーチェック
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'この操作はスーパーユーザーのみ実行できます' });
    }

    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'このユーザーは既に管理者です' });
    }

    // 管理者権限を付与
    await user.update({
      role: 'admin',
      isApproved: true // 管理者は自動的に承認済みになる
    });

    res.json({
      message: '管理者権限を付与しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Grant admin role error:', error);
    res.status(500).json({ error: '管理者権限の付与に失敗しました' });
  }
};

module.exports = {
  getPendingUsers,
  getApprovedUsers,
  approveUser,
  rejectUser,
  getDashboardStats,
  grantAdminRole
}; 