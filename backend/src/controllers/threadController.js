const { Thread, Post } = require('../models');

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