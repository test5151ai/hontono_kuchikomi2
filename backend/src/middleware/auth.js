const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: '認証が必要です' });
  }
};

// 管理者権限チェックミドルウェア
const checkAdminRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    // スーパーユーザーまたは管理者の場合のみ許可
    if (req.user.role === 'superuser' || req.user.role === 'admin' || req.user.isSuperAdmin) {
      next();
    } else {
      res.status(403).json({ error: '管理者権限が必要です' });
    }
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

module.exports = { authenticateToken, checkAdminRole }; 