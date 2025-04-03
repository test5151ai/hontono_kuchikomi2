const { Category, Thread } = require('../models');

// カテゴリー一覧を取得
exports.getAllCategories = async (req, res) => {
    try {
        console.log('カテゴリー一覧を取得開始');
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'description', 'slug'],
            order: [['id', 'ASC']]
        });
        console.log('取得したカテゴリー:', JSON.stringify(categories, null, 2));
        
        // データベースの接続状態を確認
        const [results] = await Category.sequelize.query('SELECT * FROM categories;');
        console.log('生のSQLクエリ結果:', JSON.stringify(results, null, 2));
        
        res.json(categories);
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
        const threads = await Thread.findAll({
            where: { categoryId: req.params.id },
            attributes: ['id', 'title', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(threads);
    } catch (error) {
        console.error('カテゴリー別スレッド一覧の取得に失敗:', error);
        res.status(500).json({ message: 'カテゴリー別スレッド一覧の取得に失敗しました' });
    }
}; 