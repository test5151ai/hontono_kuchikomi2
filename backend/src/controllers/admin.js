const { User } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

// メール送信の設定
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 承認待ちユーザー一覧の取得
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isApproved: false },
      attributes: ['id', 'username', 'email', 'submissionMethod', 'submissionContact', 'createdAt']
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('承認待ちユーザー取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '承認待ちユーザーの取得に失敗しました'
    });
  }
};

// ユーザー詳細情報の取得
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'submissionMethod', 'submissionContact', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('ユーザー詳細取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ユーザー詳細の取得に失敗しました'
    });
  }
};

// ユーザーの承認
const approveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    await user.update({
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: req.user.id
    });

    // 承認メールの送信
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'アカウントが承認されました',
      text: `${user.username}様\n\nアカウントが承認されました。\nログインして掲示板の機能をご利用いただけます。`
    });

    res.json({
      success: true,
      message: 'ユーザーを承認しました',
      data: user
    });
  } catch (error) {
    console.error('ユーザー承認エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ユーザーの承認に失敗しました'
    });
  }
};

// ユーザーの拒否
const rejectUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    const { reason } = req.body;

    // 拒否メールの送信
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'アカウント承認が拒否されました',
      text: `${user.username}様\n\nアカウントの承認が拒否されました。\n\n理由：${reason || '基準を満たしていません'}\n\n基準を満たすスクリーンショットを再度提出してください。`
    });

    res.json({
      success: true,
      message: 'ユーザーを拒否しました'
    });
  } catch (error) {
    console.error('ユーザー拒否エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ユーザーの拒否に失敗しました'
    });
  }
};

// 一括承認
const bulkApproveUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    await User.update(
      {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      {
        where: {
          id: userIds
        }
      }
    );

    // 承認されたユーザーの取得
    const approvedUsers = await User.findAll({
      where: {
        id: userIds
      }
    });

    // 各ユーザーにメール送信
    for (const user of approvedUsers) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'アカウントが承認されました',
        text: `${user.username}様\n\nアカウントが承認されました。\nログインして掲示板の機能をご利用いただけます。`
      });
    }

    res.json({
      success: true,
      message: `${userIds.length}人のユーザーを承認しました`
    });
  } catch (error) {
    console.error('一括承認エラー:', error);
    res.status(500).json({
      success: false,
      error: '一括承認に失敗しました'
    });
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
  getUserDetails,
  approveUser,
  rejectUser,
  bulkApproveUsers,
  getDashboardStats,
  grantAdminRole
}; 