const { Thread, Post, Category, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// デバッグログ用関数
const debug = (message, data) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message, data);
    }
};

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
        debug('受信したデータ:', { categoryId, title, content, authorName });

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
        debug('作成されたスレッド:', thread);

        // 最初の投稿を作成
        const post = await Post.create({
            threadId: thread.id,
            content,
            authorName: authorName || '名無しさん',
            ipAddress: req.ip
        });
        debug('作成された投稿:', post);

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
            }],
            attributes: [
                'id', 'title', 'categoryId', 'authorId', 
                'shopUrl', 'shopDetails', 'createdAt', 'updatedAt'
            ]
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

// 人気スレッドを取得（投稿数が多い順）
exports.getPopularThreads = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        console.log('人気スレッド取得開始 - パラメーター:', { limit });
        
        // テーブル存在確認（小文字のテーブル名を使用）
        try {
            await sequelize.query('SELECT 1 FROM "threads" LIMIT 1');
            console.log('threadsテーブル確認OK');
        } catch (tableErr) {
            console.error('threadsテーブル確認エラー:', tableErr);
            throw new Error('テーブル構造の確認に失敗しました');
        }
        
        try {
            await sequelize.query('SELECT 1 FROM "categories" LIMIT 1');
            console.log('categoriesテーブル確認OK');
        } catch (tableErr) {
            console.error('categoriesテーブル確認エラー:', tableErr);
            throw new Error('テーブル構造の確認に失敗しました');
        }
        
        try {
            await sequelize.query('SELECT 1 FROM "posts" LIMIT 1');
            console.log('postsテーブル確認OK');
        } catch (tableErr) {
            console.error('postsテーブル確認エラー:', tableErr);
            throw new Error('テーブル構造の確認に失敗しました');
        }
        
        console.log('SQLクエリ実行開始');
        // 直接SQL文を使用して、投稿数が多いスレッドを取得（小文字のテーブル名を使用）
        const result = await sequelize.query(`
            SELECT 
                t.id, 
                t.title, 
                t."categoryId", 
                t."createdAt", 
                t."updatedAt",
                c.id as "category.id", 
                c.name as "category.name",
                COUNT(p.id) as "postCount"
            FROM 
                "threads" t
            JOIN 
                "categories" c ON t."categoryId" = c.id
            LEFT JOIN 
                "posts" p ON t.id = p."threadId"
            GROUP BY 
                t.id, t.title, t."categoryId", t."createdAt", t."updatedAt", c.id, c.name
            ORDER BY 
                COUNT(p.id) DESC
            LIMIT :limit
        `, {
            replacements: { limit: parseInt(limit) },
            type: sequelize.QueryTypes.SELECT,
            logging: console.log // SQLクエリをログに出力
        });
        
        console.log('SQL結果取得完了（型）:', typeof result, Array.isArray(result));
        console.log('SQL結果取得完了（内容）:', result);
        
        // 結果を配列として処理
        let popularThreads = [];
        
        if (Array.isArray(result)) {
            // 結果が配列の場合
            popularThreads = result.map(thread => ({
                id: thread.id,
                title: thread.title,
                categoryId: thread.categoryId,
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt,
                category: {
                    id: thread["category.id"],
                    name: thread["category.name"]
                },
                postCount: parseInt(thread.postCount || '0')
            }));
        } else if (result && typeof result === 'object') {
            // 結果が単一オブジェクトの場合
            popularThreads = [{
                id: result.id,
                title: result.title,
                categoryId: result.categoryId,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                category: {
                    id: result["category.id"],
                    name: result["category.name"]
                },
                postCount: parseInt(result.postCount || '0')
            }];
        }
        
        console.log('整形後の人気スレッド:', popularThreads);
        
        res.json(popularThreads);
    } catch (error) {
        console.error('人気スレッド取得詳細エラー:', error);
        console.error('エラースタック:', error.stack);
        res.status(500).json({ 
            message: '人気スレッドの取得に失敗しました',
            error: error.message 
        });
    }
};

// 管理者用 - スレッドの店舗情報を更新
exports.updateShopDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopUrl, shopDetails } = req.body;
        
        debug('店舗情報更新: リクエスト受信', { id, shopUrl, shopDetails });
        
        // 編集対象のスレッドを取得
        const thread = await Thread.findByPk(id);
        if (!thread) {
            return res.status(404).json({
                success: false,
                message: 'スレッドが見つかりません'
            });
        }
        
        // 店舗情報を更新
        await thread.update({
            shopUrl: shopUrl || null,
            shopDetails: shopDetails || null
        });
        
        debug('店舗情報更新: 完了', { id, shopUrl, shopDetails });
        
        res.json({
            success: true,
            message: '店舗情報を更新しました',
            thread
        });
    } catch (error) {
        console.error('店舗情報更新エラー:', error);
        res.status(500).json({
            success: false,
            message: '店舗情報の更新に失敗しました'
        });
    }
};

module.exports = exports; 