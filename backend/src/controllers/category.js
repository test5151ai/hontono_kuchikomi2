const { Category, Thread } = require('../models');
const { Op } = require('sequelize');

/**
 * カテゴリー一覧を取得
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Thread,
        attributes: ['id'],
      }],
      order: [['name', 'ASC']],
    });

    // スレッド数を追加
    const categoriesWithCount = categories.map(category => ({
      ...category.toJSON(),
      threadCount: category.Threads.length,
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('カテゴリー一覧取得エラー:', error);
    res.status(500).json({ message: 'カテゴリー一覧の取得に失敗しました' });
  }
};

/**
 * カテゴリー詳細を取得
 */
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{
        model: Thread,
        attributes: ['id', 'title', 'createdAt'],
        order: [['createdAt', 'DESC']],
      }],
    });

    if (!category) {
      return res.status(404).json({ message: 'カテゴリーが見つかりません' });
    }

    res.json(category);
  } catch (error) {
    console.error('カテゴリー詳細取得エラー:', error);
    res.status(500).json({ message: 'カテゴリー詳細の取得に失敗しました' });
  }
};

/**
 * カテゴリー別スレッド一覧を取得
 */
exports.getCategoryThreads = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'カテゴリーが見つかりません' });
    }

    const offset = (page - 1) * limit;
    const { count, rows: threads } = await Thread.findAndCountAll({
      where: { categoryId: id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      category,
      threads,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('カテゴリー別スレッド一覧取得エラー:', error);
    res.status(500).json({ message: 'スレッド一覧の取得に失敗しました' });
  }
}; 