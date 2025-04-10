const { User } = require('../../models');
const { Op } = require('sequelize');

// ユーザー一覧を取得
exports.getUsers = async (req, res) => {
    try {
        console.log('=== ユーザー一覧取得開始 ===');
        console.log('リクエストクエリ:', req.query);
        
        const { page = 1, keyword = '', status = '', documentStatus = '' } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        console.log('検索条件:', {
            page,
            keyword,
            status,
            documentStatus,
            limit,
            offset
        });

        const where = {};
        if (keyword) {
            where[Op.or] = [
                { username: { [Op.like]: `%${keyword}%` } },
                { email: { [Op.like]: `%${keyword}%` } }
            ];
        }
        // ステータスと書類状態は未実装のため、一時的にコメントアウト
        // if (status) where.status = status;
        // if (documentStatus) where.documentStatus = documentStatus;

        console.log('WHERE条件:', where);

        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit,
            offset,
            attributes: ['id', 'username', 'email', 'createdAt', 'lastLoginAt', 'isApproved', 'role'],
            order: [['createdAt', 'DESC']]
        });

        console.log('取得したユーザー数:', count);
        console.log('ユーザーデータ:', users);

        res.json({
            success: true,
            data: {
                users,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error('ユーザー一覧取得エラー:', error);
        res.status(500).json({
            success: false,
            message: 'ユーザー一覧の取得に失敗しました'
        });
    }
};

// ユーザー詳細を取得
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                {
                    association: 'activities',
                    order: [['createdAt', 'DESC']],
                    limit: 10
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('ユーザー詳細取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// ユーザーを承認
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        user.isApproved = true;
        user.approvedAt = new Date();
        user.approvedBy = req.user.id;
        await user.save();

        res.json({
            success: true,
            message: 'ユーザーを承認しました'
        });
    } catch (error) {
        console.error('ユーザー承認エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// ユーザーを拒否
exports.rejectUser = async (req, res) => {
    try {
        console.log('=== ユーザー拒否処理開始 ===');
        console.log('拒否するユーザーID:', req.params.id);
        
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'ユーザーが見つかりません' 
            });
        }

        // 拒否フラグとしてdocumentStatusを'rejected'に設定
        user.isApproved = false;
        user.documentStatus = 'rejected';
        user.documentRejectReason = req.body.reason || '管理者による拒否';
        
        await user.save();

        console.log('ユーザー拒否完了:', user.username, user.documentStatus);
        
        res.json({
            success: true,
            message: 'ユーザーを拒否しました'
        });
    } catch (error) {
        console.error('ユーザー拒否エラー:', error);
        res.status(500).json({ 
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

// ユーザーを一括承認
exports.bulkApproveUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        const now = new Date();
        
        await User.update(
            { 
                isApproved: true,
                approvedAt: now,
                approvedBy: req.user.id
            },
            { where: { id: userIds } }
        );

        res.json({
            success: true,
            message: '選択したユーザーを承認しました'
        });
    } catch (error) {
        console.error('ユーザー一括承認エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// ユーザーを停止
exports.suspendUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        user.status = 'suspended';
        await user.save();

        res.json({
            success: true,
            message: 'ユーザーを停止しました'
        });
    } catch (error) {
        console.error('ユーザー停止エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// ユーザーを一括停止
exports.bulkSuspendUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        
        await User.update(
            { status: 'suspended' },
            { where: { id: userIds } }
        );

        res.json({
            success: true,
            message: '選択したユーザーを停止しました'
        });
    } catch (error) {
        console.error('ユーザー一括停止エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// ユーザー情報をエクスポート
exports.exportUsers = async (req, res) => {
    try {
        const { keyword = '', status = '', documentStatus = '' } = req.body;

        // 検索条件の構築
        const where = {};
        if (keyword) {
            where[Op.or] = [
                { username: { [Op.like]: `%${keyword}%` } },
                { email: { [Op.like]: `%${keyword}%` } }
            ];
        }
        if (status) {
            where.status = status;
        }
        if (documentStatus) {
            where.documentStatus = documentStatus;
        }

        // ユーザー一覧を取得
        const users = await User.findAll({
            where,
            attributes: ['id', 'username', 'email', 'status', 'documentStatus', 'createdAt', 'lastLoginAt'],
            order: [['createdAt', 'DESC']]
        });

        // CSVデータの生成
        const csvHeader = 'ID,ユーザー名,メールアドレス,ステータス,書類状態,登録日時,最終ログイン\n';
        const csvRows = users.map(user => {
            return [
                user.id,
                user.username,
                user.email,
                user.status,
                user.documentStatus,
                user.createdAt,
                user.lastLoginAt
            ].join(',');
        }).join('\n');

        const csvData = csvHeader + csvRows;

        // レスポンスヘッダーの設定
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

        res.send(csvData);
    } catch (error) {
        console.error('ユーザー情報エクスポートエラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// ユーザーに管理者権限を付与
exports.grantAdminRole = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        user.role = 'admin';
        await user.save();

        res.json({
            success: true,
            message: '管理者権限を付与しました'
        });
    } catch (error) {
        console.error('管理者権限付与エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// 承認待ちユーザーを取得
exports.getPendingUsers = async (req, res) => {
    try {
        console.log('=== 承認待ちユーザー取得開始 ===');
        
        const users = await User.findAll({
            where: {
                isApproved: false
            },
            attributes: [
                'id', 'username', 'email', 'documentStatus', 
                'documentSubmittedAt', 'createdAt', 'documentRejectReason'
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log('取得した承認待ちユーザー数:', users.length);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('承認待ちユーザー取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '承認待ちユーザーの取得に失敗しました',
            error: error.message
        });
    }
};

// 新規管理者アカウントを作成（スーパーユーザーのみ実行可能）
exports.createAdmin = async (req, res) => {
    try {
        console.log('=== 新規管理者作成処理開始 ===');
        console.log('リクエストボディ:', req.body);
        
        // スーパーユーザー権限チェック
        if (!req.user.isSuperAdmin) {
            console.log('権限エラー: スーパーユーザーではないため拒否');
            return res.status(403).json({
                success: false,
                message: 'この操作を実行する権限がありません。スーパーユーザーのみが実行できます。'
            });
        }

        const { username, email, password, role } = req.body;

        // 必須項目の検証
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'ユーザー名、メールアドレス、パスワードは必須です'
            });
        }

        // メールアドレスの重複チェック
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'このメールアドレスは既に使用されています'
            });
        }

        // 管理者アカウント作成（デフォルトで承認済み）
        const newAdmin = await User.create({
            username,
            email,
            password,
            role: role || 'admin', // デフォルトは admin
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: req.user.id,
            submissionMethod: 'direct',
            submissionContact: email
        });

        console.log('新規管理者作成完了:', {
            id: newAdmin.id,
            username: newAdmin.username,
            role: newAdmin.role
        });

        res.status(201).json({
            success: true,
            message: '管理者アカウントを作成しました',
            data: {
                id: newAdmin.id,
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    } catch (error) {
        console.error('管理者作成エラー:', error);
        res.status(500).json({
            success: false,
            message: '管理者アカウントの作成に失敗しました',
            error: error.message
        });
    }
}; 