const jwt = require('jsonwebtoken');
const { User } = require('../models');
const createResponse = require('../utils/response');

// デバッグログ用関数
const debug = (message, data) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message, data);
    }
};

// トークンを検証するミドルウェア
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: '認証が必要です' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'ユーザーが見つかりません' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'admin',
            isApproved: user.isApproved
        };
        next();
    } catch (error) {
        console.error('トークン検証エラー:', error);
        res.status(401).json({ error: '無効なトークンです' });
    }
};

// 管理者権限をチェックするミドルウェア
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: 'スレッドの作成は管理者のみが行えます'
            });
        }
        next();
    } catch (error) {
        console.error('管理者権限チェックエラー:', error);
        res.status(500).json({ error: '権限チェック中にエラーが発生しました' });
    }
};

// 承認済みユーザーをチェックするミドルウェア
const checkApproved = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isApproved) {
            return res.status(403).json({ 
                success: false,
                message: '承認済みユーザーのみが利用できます'
            });
        }
        next();
    } catch (error) {
        console.error('承認チェックエラー:', error);
        res.status(500).json({ error: '承認チェック中にエラーが発生しました' });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    checkApproved
}; 