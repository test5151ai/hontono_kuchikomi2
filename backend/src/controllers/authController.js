const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const createResponse = require('../utils/response');

const authController = {
    // ログイン処理
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'メールアドレスまたはパスワードが正しくありません。'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'メールアドレスまたはパスワードが正しくありません。'
                });
            }

            if (!user.isApproved) {
                return res.status(403).json({
                    success: false,
                    message: 'アカウントが承認されていません。管理者の承認をお待ちください。'
                });
            }

            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    isAdmin: user.role === 'admin',
                    isApproved: user.isApproved
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'ログイン処理中にエラーが発生しました。'
            });
        }
    },

    // 新規登録処理
    register: async (req, res) => {
        try {
            const { email, password, username } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json(createResponse.error('このメールアドレスは既に登録されています'));
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                email,
                password: hashedPassword,
                username,
                role: 'user',
                isApproved: false
            });

            res.status(201).json({ 
                message: '登録が完了しました',
                userId: user.id
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json(createResponse.error('登録処理中にエラーが発生しました'));
        }
    },

    // トークンリフレッシュ
    refreshToken: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json(createResponse.error('認証トークンが必要です'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(401).json(createResponse.error('ユーザーが見つかりません'));
            }

            if (!user.isApproved) {
                return res.status(403).json(createResponse.error('アカウントが承認されていません'));
            }

            const newToken = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    isAdmin: user.role === 'admin',
                    isApproved: user.isApproved
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token: newToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved
                }
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json(createResponse.error('トークンの更新に失敗しました'));
        }
    }
};

module.exports = authController; 