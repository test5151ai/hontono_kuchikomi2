const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op } = require('sequelize');

// 新規登録
const register = async (req, res) => {
  try {
    const { username, email, password, submission_method, submission_contact } = req.body;
    
    console.log('新規登録リクエスト受信:', { 
      username, 
      email, 
      passwordLength: password ? password.length : 0,
      submission_method, 
      hasSubmissionContact: !!submission_contact 
    });

    // 入力値の検証
    if (!username || !email || !password) {
      console.log('入力検証エラー: 必須項目が不足しています', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ error: 'ユーザー名、メールアドレス、パスワードは必須項目です' });
    }

    if (!submission_method || !submission_contact) {
      console.log('入力検証エラー: 連絡方法と連絡先が不足しています', { submission_method, submission_contact });
      return res.status(400).json({ error: '連絡方法と連絡先は必須項目です' });
    }

    // ユーザーが既に存在するかチェック
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      console.log('既存ユーザーの検出:', { 
        existingEmail: existingUser.email === email, 
        existingUsername: existingUser.username === username 
      });
      
      return res.status(400).json({ error: 'このユーザー名またはメールアドレスは既に使用されています' });
    }

    // パスワードのハッシュ化 (bcryptjs を使用)
    const bcryptjs = require('bcryptjs');
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log('パスワードをハッシュ化しました');

    // ユーザーの作成
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isApproved: false,
      submission_method: submission_method || 'email',
      submission_contact: submission_contact || email
    });
    
    console.log('ユーザーを作成しました:', { id: user.id, username: user.username });

    // JWTトークンの生成
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('トークンを生成しました');

    res.status(201).json({
      message: 'ユーザー登録が完了しました。管理者の承認をお待ちください。',
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
    
    console.log('ログインリクエスト受信:', { email, passwordLength: password ? password.length : 0 });

    // 入力値の検証
    if (!email || !password) {
      console.log('入力検証エラー: メールアドレスまたはパスワードが空です');
      return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' });
    }
    
    // テスト用アカウントの場合は特別処理
    if (email === 'test5151@gmail.com' && password === '5151test') {
      console.log('テスト用アカウントを使用: 認証をバイパスします');
      
      // テストユーザーを検索または作成
      let user = await User.findOne({ where: { email } });
      
      if (!user) {
        console.log('テストユーザーが存在しないため作成します');
        // テスト用ユーザーを作成
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user = await User.create({
          username: 'test5151',
          email: 'test5151@gmail.com',
          password: hashedPassword,
          role: 'admin',
          isApproved: true,
          is_super_admin: true,
          submission_method: 'email',
          submission_contact: 'test5151@gmail.com'
        });
      }
      
      // JWTトークンの生成
      const token = jwt.sign(
        { 
          id: user.id,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      console.log('トークン生成完了: テストアカウントログイン成功');
      
      return res.json({
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
    }

    // 通常の認証フロー：ユーザーの検索
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`ユーザーが見つかりません: ${email}`);
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    console.log('ユーザー検索完了:', { id: user.id, username: user.username, role: user.role });

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('パスワード検証結果:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('パスワードが一致しません');
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // スーパーユーザーと管理者は常にログイン可能
    if (user.role !== 'superuser' && user.role !== 'admin' && !user.isApproved) {
      console.log('アカウントが承認されていません');
      return res.status(403).json({ error: 'アカウントが承認されていません' });
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('ログイン成功:', { id: user.id, username: user.username });

    // 最終ログイン日時を更新
    await user.update({ lastLoginAt: new Date() });

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
    res.status(500).json({ 
      error: 'ログインに失敗しました',
      details: error.message 
    });
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