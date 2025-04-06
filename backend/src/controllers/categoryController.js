const { Category, Thread } = require('../models');

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

// カテゴリー別スレッド一覧を取得
exports.getCategoryThreads = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        // カテゴリーの存在確認
        const category = await Category.findByPk(id, {
            attributes: ['id', 'name', 'description']
        });
        
        if (!category) {
            return res.status(404).json({ message: 'カテゴリーが見つかりません' });
        }
        
        // ページネーション用のオフセット計算
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // スレッド数のカウントとスレッド取得
        const { count, rows: threads } = await Thread.findAndCountAll({
            where: { categoryId: id },
            attributes: ['id', 'title', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });
        
        // レスポンスの整形
        res.json({
            category,
            threads,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('カテゴリー別スレッド一覧の取得に失敗:', error);
        res.status(500).json({ message: 'カテゴリー別スレッド一覧の取得に失敗しました' });
    }
}; 