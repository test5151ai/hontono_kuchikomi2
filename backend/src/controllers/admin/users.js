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
        if (status) where.status = status;
        if (documentStatus) where.documentStatus = documentStatus;

        console.log('WHERE条件:', where);

        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit,
            offset,
            attributes: ['id', 'username', 'email', 'createdAt', 'lastLoginAt'],
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

        user.status = 'approved';
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

// ユーザーを一括承認
exports.bulkApproveUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        await User.update(
            { status: 'approved' },
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