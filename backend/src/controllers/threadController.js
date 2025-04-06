const { Thread, Post, Category } = require('../models');

// スレッドを作成
exports.createThread = async (req, res) => {
    try {
        const { categoryId, title, content, authorName } = req.body;
        console.log('受信したデータ:', { categoryId, title, content, authorName });  // デバッグログ追加

        // スレッドを作成
        const thread = await Thread.create({
            categoryId,
            title
        });
        console.log('作成されたスレッド:', thread);  // デバッグログ追加

        // 最初の投稿を作成
        const post = await Post.create({
            threadId: thread.id,
            content,
            authorName: authorName || '名無しさん',
            ipAddress: req.ip
        });
        console.log('作成された投稿:', post);  // デバッグログ追加

        res.status(201).json({
            id: thread.id,
            message: 'スレッドを作成しました'
        });
    } catch (error) {
        console.error('スレッド作成エラー:', error);
        res.status(500).json({ message: 'スレッドの作成に失敗しました' });
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