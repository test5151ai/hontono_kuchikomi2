const { Thread, Post, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * タイトルに「の情報スレ」を追加（もし既に含まれていなければ）
 */
function appendInfoThreadSuffix(title) {
    const suffix = 'の情報スレ';
    if (!title.endsWith(suffix)) {
        return `${title}${suffix}`;
    }
    return title;
}

// スレッドを作成
exports.createThread = async (req, res) => {
    try {
        const { categoryId, title, content, authorName } = req.body;
        console.log('受信したデータ:', { categoryId, title, content, authorName });

        // タイトルに「の情報スレ」を追加
        const formattedTitle = appendInfoThreadSuffix(title);

        // タイトルの重複チェック
        const existingThread = await Thread.findOne({
            where: {
                title: {
                    [Op.eq]: formattedTitle
                },
                categoryId: categoryId
            }
        });

        if (existingThread) {
            return res.status(400).json({
                success: false,
                message: '同じタイトルのスレッドが既に存在します'
            });
        }

        // スレッドを作成
        const thread = await Thread.create({
            categoryId,
            title: formattedTitle
        });
        console.log('作成されたスレッド:', thread);

        // 最初の投稿を作成
        const post = await Post.create({
            threadId: thread.id,
            content,
            authorName: authorName || '名無しさん',
            ipAddress: req.ip
        });
        console.log('作成された投稿:', post);

        res.status(201).json({
            success: true,
            id: thread.id,
            message: 'スレッドを作成しました'
        });
    } catch (error) {
        console.error('スレッド作成エラー:', error);
        res.status(500).json({
            success: false,
            message: 'スレッドの作成に失敗しました'
        });
    }
};

// スレッド詳細を取得
exports.getThread = async (req, res) => {
    try {
        const { id } = req.params;
        
        const thread = await Thread.findByPk(id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'description']
            }]
        });
        
        if (!thread) {
            return res.status(404).json({ message: 'スレッドが見つかりません' });
        }
        
        res.json(thread);
    } catch (error) {
        console.error('スレッド取得エラー:', error);
        res.status(500).json({ message: 'スレッドの取得に失敗しました' });
    }
};

// スレッドの投稿一覧を取得
exports.getThreadPosts = async (req, res) => {
    try {
        const { id } = req.params;
        
        // スレッドの存在確認
        const thread = await Thread.findByPk(id);
        if (!thread) {
            return res.status(404).json({ message: 'スレッドが見つかりません' });
        }
        
        // 投稿を取得
        const posts = await Post.findAll({
            where: { threadId: id },
            order: [['createdAt', 'ASC']]
        });
        
        res.json(posts);
    } catch (error) {
        console.error('投稿一覧取得エラー:', error);
        res.status(500).json({ message: '投稿一覧の取得に失敗しました' });
    }
};

// スレッドに投稿を追加
exports.createPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, authorName } = req.body;
        
        // スレッドの存在確認
        const thread = await Thread.findByPk(id);
        if (!thread) {
            return res.status(404).json({ message: 'スレッドが見つかりません' });
        }
        
        // 投稿を作成
        const post = await Post.create({
            threadId: id,
            content,
            authorName: authorName || '名無しさん',
            ipAddress: req.ip
        });
        
        res.status(201).json(post);
    } catch (error) {
        console.error('投稿作成エラー:', error);
        res.status(500).json({ message: '投稿の作成に失敗しました' });
    }
};

// 管理者用 - スレッドを編集
exports.updateThread = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, categoryId } = req.body;
        
        // 編集対象のスレッドを取得
        const thread = await Thread.findByPk(id);
        if (!thread) {
            return res.status(404).json({
                success: false,
                message: 'スレッドが見つかりません'
            });
        }
        
        // タイトルに「の情報スレ」を追加
        const formattedTitle = title ? appendInfoThreadSuffix(title) : thread.title;
        
        // タイトル変更時は重複チェック
        if (formattedTitle && formattedTitle !== thread.title) {
            const existingThread = await Thread.findOne({
                where: {
                    title: {
                        [Op.eq]: formattedTitle
                    },
                    categoryId: categoryId || thread.categoryId,
                    id: {
                        [Op.ne]: id // 自分自身は除外
                    }
                }
            });
            
            if (existingThread) {
                return res.status(400).json({
                    success: false,
                    message: '同じタイトルのスレッドが既に存在します'
                });
            }
        }
        
        // スレッドを更新
        const updateData = {};
        if (title) updateData.title = formattedTitle;
        if (categoryId) updateData.categoryId = categoryId;
        
        await thread.update(updateData);
        
        res.json({
            success: true,
            message: 'スレッドを更新しました',
            thread
        });
    } catch (error) {
        console.error('スレッド更新エラー:', error);
        res.status(500).json({
            success: false,
            message: 'スレッドの更新に失敗しました'
        });
    }
};

// 管理者用 - スレッドを削除
exports.deleteThread = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 対象のスレッドを確認
        const thread = await Thread.findByPk(id);
        if (!thread) {
            return res.status(404).json({
                success: false,
                message: 'スレッドが見つかりません'
            });
        }
        
        // 関連する投稿も削除（カスケード削除の設定があれば自動的に削除される）
        // 明示的に投稿も削除する場合
        await Post.destroy({ where: { threadId: id } });
        
        // スレッドを削除
        await thread.destroy();
        
        res.json({
            success: true,
            message: 'スレッドを削除しました'
        });
    } catch (error) {
        console.error('スレッド削除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'スレッドの削除に失敗しました'
        });
    }
}; 