const { User } = require('../../models');

/**
 * ユーザープロフィールを更新する
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, icon } = req.body;

        console.log('=== プロフィール更新リクエスト ===');
        console.log('ユーザーID:', userId);
        console.log('リクエストボディ:', req.body);
        console.log('ニックネーム:', username);
        console.log('アイコン:', icon);

        // バリデーション
        if (!username || username.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'ニックネームは必須です'
            });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'ニックネームは3〜30文字である必要があります'
            });
        }

        // ユーザーの存在確認
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        console.log('更新前のユーザー:', {
            id: user.id,
            username: user.username,
            icon: user.icon
        });

        // 現在のユーザー名と同じ場合は一意性チェックをスキップ
        if (username !== user.username) {
            // ユーザー名の一意性をチェック
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'このニックネームは既に使用されています'
                });
            }
        }

        // プロフィールを更新
        const updatedData = { username };
        
        // アイコンが指定されている場合は更新
        if (icon) {
            updatedData.icon = icon;
        }

        console.log('更新データ:', updatedData);

        await user.update(updatedData);
        
        // 更新後のユーザー情報を取得して確認
        const updatedUser = await User.findByPk(userId);
        console.log('更新後のユーザー:', {
            id: updatedUser.id,
            username: updatedUser.username,
            icon: updatedUser.icon
        });

        res.json({
            success: true,
            message: 'プロフィールが更新されました',
            data: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                icon: updatedUser.icon,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    } catch (error) {
        console.error('プロフィール更新エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
}; 