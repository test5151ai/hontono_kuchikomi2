const { Category, Thread } = require('../../models');
const { Op } = require('sequelize');

/**
 * カテゴリー一覧を取得（管理者用）
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

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('カテゴリー一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'カテゴリー一覧の取得に失敗しました'
    });
  }
};

/**
 * カテゴリーを作成
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    // バリデーション
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'カテゴリー名とスラッグは必須です'
      });
    }

    // スラッグの重複チェック
    const existingCategory = await Category.findOne({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'このスラッグは既に使用されています'
      });
    }

    const category = await Category.create({
      name,
      description,
      slug
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('カテゴリー作成エラー:', error);
    res.status(500).json({
      success: false,
      error: 'カテゴリーの作成に失敗しました'
    });
  }
};

/**
 * カテゴリーを更新
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'カテゴリーが見つかりません'
      });
    }

    // スラッグの重複チェック（自分以外）
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({
        where: { 
          slug,
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'このスラッグは既に使用されています'
        });
      }
    }

    await category.update({
      name: name || category.name,
      description: description || category.description,
      slug: slug || category.slug
    });

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('カテゴリー更新エラー:', error);
    res.status(500).json({
      success: false,
      error: 'カテゴリーの更新に失敗しました'
    });
  }
};

/**
 * カテゴリーを削除
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{
        model: Thread,
        attributes: ['id']
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'カテゴリーが見つかりません'
      });
    }

    // スレッドが存在する場合は削除不可
    if (category.Threads.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'スレッドが存在するカテゴリーは削除できません'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'カテゴリーを削除しました'
    });
  } catch (error) {
    console.error('カテゴリー削除エラー:', error);
    res.status(500).json({
      success: false,
      error: 'カテゴリーの削除に失敗しました'
    });
  }
}; 