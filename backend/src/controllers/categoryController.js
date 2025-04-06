const { Category, Thread, Post, sequelize } = require('../models');
const { Op } = require('sequelize');

// カテゴリー一覧を取得
exports.getAllCategories = async (req, res) => {
    try {
        console.log('カテゴリー一覧を取得開始');
        const categories = await Category.findAll({
            include: [{
                model: Thread,
                as: 'threads',
                attributes: ['id'],
            }],
            order: [['id', 'ASC']]
        });
        
        // スレッド数を追加
        const categoriesWithCount = categories.map(category => {
            const categoryJson = category.toJSON();
            return {
                ...categoryJson,
                threadCount: category.threads ? category.threads.length : 0
            };
        });
        
        console.log('スレッド数を追加したカテゴリー:', JSON.stringify(categoriesWithCount, null, 2));
        
        res.json(categoriesWithCount);
    } catch (error) {
        console.error('カテゴリー一覧の取得に失敗:', error);
        res.status(500).json({ message: 'カテゴリー一覧の取得に失敗しました' });
    }
};

// カテゴリー詳細を取得
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            attributes: ['id', 'name', 'description']
        });
        
        if (!category) {
            return res.status(404).json({ message: 'カテゴリーが見つかりません' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('カテゴリー詳細の取得に失敗:', error);
        res.status(500).json({ message: 'カテゴリー詳細の取得に失敗しました' });
    }
};

// カテゴリー別のスレッド一覧を取得
exports.getCategoryThreads = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, search = '', sort = 'createdAt', order = 'desc' } = req.query;
        
        // カテゴリーの存在確認
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'カテゴリーが見つかりません' });
        }
        
        // 検索条件の構築
        const whereClause = { categoryId: id };
        if (search) {
            whereClause.title = { [Op.iLike]: `%${search}%` };
        }
        
        // ソート条件の検証
        const validSortFields = ['createdAt', 'title', 'updatedAt'];
        const validOrders = ['asc', 'desc'];
        
        const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
        const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
        
        // ページネーション設定
        const offset = (page - 1) * limit;
        
        // スレッド総数の取得
        const totalThreads = await Thread.count({ where: whereClause });
        
        // スレッド一覧の取得
        const threads = await Thread.findAll({
            attributes: [
                'id', 'title', 'categoryId', 'createdAt', 'updatedAt'
            ],
            where: whereClause,
            order: [[sortField, sortOrder]],
            limit: parseInt(limit),
            offset: offset
        });
        
        // 投稿数と最終投稿日時の取得
        const threadsWithStats = await Promise.all(threads.map(async (thread) => {
            const threadObj = thread.toJSON();
            
            // 投稿数を取得
            const postCount = await Post.count({ where: { threadId: thread.id } });
            threadObj.postCount = postCount;
            
            // 最新投稿の日時を取得
            const latestPost = await Post.findOne({
                where: { threadId: thread.id },
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt']
            });
            
            if (latestPost) {
                threadObj.lastPostedAt = latestPost.createdAt;
            }
            
            return threadObj;
        }));
        
        // ページネーション情報の構築
        const totalPages = Math.ceil(totalThreads / limit);
        
        // 応答データの構築
        const responseData = {
            threads: threadsWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalThreads,
                totalPages
            },
            filters: {
                search,
                sort: sortField,
                order: sortOrder
            }
        };
        
        res.json(responseData);
    } catch (error) {
        console.error('カテゴリースレッド一覧取得エラー:', error);
        res.status(500).json({ message: 'カテゴリーのスレッド一覧の取得に失敗しました' });
    }
}; 