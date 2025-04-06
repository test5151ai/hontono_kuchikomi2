const { Thread, Category, Post } = require('../../models');
const { Op } = require('sequelize');

/**
 * 管理者用スレッド一覧取得
 */
exports.getThreads = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 検索条件
    const whereCondition = {};
    if (search) {
      whereCondition.title = {
        [Op.like]: `%${search}%`
      };
    }
    
    // スレッド一覧を取得
    const { count, rows: threads } = await Thread.findAndCountAll({
      where: whereCondition,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.json({
      success: true,
      threads,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('管理者用スレッド一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スレッド一覧の取得に失敗しました'
    });
  }
};

/**
 * 同じカテゴリー内の重複タイトルチェック
 */
exports.checkDuplicateTitle = async (req, res) => {
  try {
    const { title, categoryId, threadId } = req.body;
    
    // 検索条件
    const whereCondition = {
      title: {
        [Op.eq]: title
      },
      categoryId
    };
    
    // 編集時は自身を除外
    if (threadId) {
      whereCondition.id = {
        [Op.ne]: threadId
      };
    }
    
    // 重複チェック
    const existingThread = await Thread.findOne({
      where: whereCondition
    });
    
    res.json({
      success: true,
      isDuplicate: !!existingThread,
      thread: existingThread
    });
  } catch (error) {
    console.error('タイトル重複チェックエラー:', error);
    res.status(500).json({
      success: false,
      message: 'タイトル重複チェックに失敗しました'
    });
  }
}; 