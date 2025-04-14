const jwt = require('jsonwebtoken');
const { User } = require('../models');

// デバッグログ用関数
const debug = (message, data) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message, data);
    }
};

const authMiddleware = {
    // トークン検証
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: '認証トークンが必要です'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ 
                success: false,
                message: '無効なトークンです'
            });
        }
    },

    // 管理者権限チェック
    checkAdmin: (req, res, next) => {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: '管理者権限が必要です'
            });
        }
        next();
    },

    // 承認済みユーザーチェック
    checkApproved: (req, res, next) => {
        if (!req.user || !req.user.isApproved) {
            return res.status(403).json({ 
                success: false,
                message: 'ユーザーが承認されていません'
            });
        }
        next();
    }
};

module.exports = authMiddleware; 