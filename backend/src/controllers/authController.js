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
                return res.status(401).json(createResponse.error('メールアドレスまたはパスワードが正しくありません'));
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json(createResponse.error('メールアドレスまたはパスワードが正しくありません'));
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

            res.json(createResponse.success({ token }));
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json(createResponse.error('ログイン処理中にエラーが発生しました'));
        }
    },

    // 新規登録処理
    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json(createResponse.error('このメールアドレスは既に登録されています'));
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                email,
                password: hashedPassword,
                name,
                role: 'user',
                isApproved: false
            });

            res.status(201).json(createResponse.success({ 
                message: '登録が完了しました',
                userId: user.id
            }));
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

            res.json(createResponse.success({ token: newToken }));
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json(createResponse.error('トークンの更新に失敗しました'));
        }
    }
};

module.exports = authController; 