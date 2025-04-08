const { AccessLog, Thread, Sequelize, User } = require('../../models');
const { Op } = require('sequelize');

/**
 * 月間アクセス統計を取得
 */
exports.getMonthlyAccessStats = async (req, res) => {
  try {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    
    // 過去12ヶ月間のアクセスログをグループ化して集計
    const accessStats = await AccessLog.findAll({
      attributes: [
        [Sequelize.fn('date_trunc', 'month', Sequelize.col('createdAt')), 'month'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: oneYearAgo
        }
      },
      group: [Sequelize.fn('date_trunc', 'month', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('date_trunc', 'month', Sequelize.col('createdAt')), 'ASC']]
    });

    // 月ごとのデータを整形
    const monthlyData = [];
    const labels = [];
    
    // 過去12ヶ月間の各月をループ
    for (let i = 0; i < 12; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
      const monthStr = month.toISOString().substring(0, 7); // YYYY-MM形式
      
      // フォーマットした月名を取得
      const monthName = month.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
      labels.push(monthName);
      
      // その月のアクセス数を検索
      const monthData = accessStats.find(stat => {
        const statMonth = new Date(stat.dataValues.month).toISOString().substring(0, 7);
        return statMonth === monthStr;
      });
      
      // アクセス数を追加（データがない場合は0）
      monthlyData.push(monthData ? parseInt(monthData.dataValues.count) : 0);
    }
    
    res.json({
      success: true,
      data: {
        labels,
        accessCounts: monthlyData
      }
    });
  } catch (error) {
    console.error('月間アクセス統計の取得に失敗:', error);
    res.status(500).json({
      success: false,
      error: '月間アクセス統計の取得に失敗しました'
    });
  }
};

/**
 * 人気スレッドランキングを取得
 */
exports.getPopularThreads = async (req, res) => {
  try {
    // スレッドIDごとのアクセス数を集計
    const threadStats = await AccessLog.findAll({
      attributes: [
        'threadId',
        [Sequelize.fn('count', Sequelize.col('id')), 'viewCount']
      ],
      where: {
        threadId: {
          [Op.ne]: null
        }
      },
      group: ['threadId'],
      order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
      limit: 10
    });
    
    // スレッドの詳細情報を取得
    const threadIds = threadStats.map(stat => stat.threadId);
    const threads = await Thread.findAll({
      where: {
        id: {
          [Op.in]: threadIds
        }
      },
      attributes: ['id', 'title', 'slug', 'categoryId', 'userId', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });
    
    // スレッド情報とアクセス数を結合
    const popularThreads = threadStats.map(stat => {
      const thread = threads.find(t => t.id === stat.threadId);
      return {
        id: stat.threadId,
        title: thread ? thread.title : '削除されたスレッド',
        viewCount: parseInt(stat.dataValues.viewCount),
        user: thread ? thread.user : null,
        createdAt: thread ? thread.createdAt : null
      };
    });
    
    res.json({
      success: true,
      data: popularThreads
    });
  } catch (error) {
    console.error('人気スレッドランキングの取得に失敗:', error);
    res.status(500).json({
      success: false,
      error: '人気スレッドランキングの取得に失敗しました'
    });
  }
}; 