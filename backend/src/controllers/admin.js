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

// ユーザーの承認
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id; // 承認した管理者のID

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

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser
}; 