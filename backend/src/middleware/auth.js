const jwt = require('jsonwebtoken');
const { User } = require('../models');

// デバッグログ用関数
const debug = (message, data) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message, data);
    }
};

const authenticateToken = async (req, res, next) => {
  try {
    debug('authenticateToken ミドルウェア実行:', {
      headers: req.headers,
      authorization: req.header('Authorization')
    });

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      debug('トークンが存在しません');
      throw new Error();
    }

    debug('トークンを検証:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    debug('トークン検証結果:', decoded);

    const user = await User.findOne({ where: { id: decoded.id } });
    debug('ユーザー検索結果:', user ? {
      id: user.id,
      role: user.role,
      isApproved: user.isApproved
    } : null);

    if (!user) {
      debug('ユーザーが見つかりません');
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('authenticateToken ミドルウェアエラー:', error.message);
    res.status(401).json({ error: '認証が必要です' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    debug('isAdmin ミドルウェア実行:', {
      user: req.user ? {
        id: req.user.id,
        role: req.user.role,
        isApproved: req.user.isApproved
      } : null,
      headers: req.headers
    });

    if (!req.user) {
      throw new Error('認証が必要です');
    }

    if (!req.user.isApproved) {
      throw new Error('アカウントが承認されていません');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'superuser') {
      throw new Error('管理者権限が必要です');
    }

    next();
  } catch (error) {
    console.error('isAdmin ミドルウェアエラー:', error.message);
    res.status(403).json({ error: error.message });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
}; 