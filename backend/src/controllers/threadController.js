const { Thread, Post } = require('../models');

// スレッドを作成
exports.createThread = async (req, res) => {
    try {
        const { categoryId, title, content, authorName } = req.body;

        // スレッドを作成
        const thread = await Thread.create({
            categoryId,
            title
        });

        // 最初の投稿を作成
        await Post.create({
            threadId: thread.id,
            content,
            authorName: authorName || '名無しさん',
            ipAddress: req.ip
        });

        res.status(201).json({
            id: thread.id,
            message: 'スレッドを作成しました'
        });
    } catch (error) {
        console.error('スレッド作成エラー:', error);
        res.status(500).json({ message: 'スレッドの作成に失敗しました' });
    }
}; 