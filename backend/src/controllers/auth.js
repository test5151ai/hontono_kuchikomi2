const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');

// 新規登録
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 入力値の検証
    if (!username || !email || !password) {
      return res.status(400).json({ error: '全ての項目を入力してください' });
    }

    // ユーザーが既に存在するかチェック
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'このユーザー名またはメールアドレスは既に使用されています' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーの作成
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      isApproved: role === 'admin'
    });

    // JWTトークンの生成
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'ユーザー登録に失敗しました',
      details: error.message 
    });
  }
};

// ログイン
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 入力値の検証
    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' });
    }

    // ユーザーの検索
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // 承認済みユーザーのみログイン可能
    if (!user.isApproved) {
      return res.status(403).json({ error: 'アカウントが承認されていません' });
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
};

// ログアウト
const logout = async (req, res) => {
  try {
    res.json({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'ログアウトに失敗しました' });
  }
};

module.exports = {
  register,
  login,
  logout
}; 