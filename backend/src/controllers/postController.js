const { Post, Thread } = require('../models');

/**
 * 投稿を編集（管理者用）
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, authorName } = req.body;

    // 投稿の存在確認
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '投稿が見つかりません'
      });
    }

    // 投稿を更新
    await post.update({
      content,
      authorName: authorName || '名無しさん'
    });

    res.json({
      success: true,
      message: '投稿を更新しました',
      post
    });
  } catch (error) {
    console.error('投稿更新エラー:', error);
    res.status(500).json({
      success: false,
      message: '投稿の更新に失敗しました'
    });
  }
};

/**
 * 投稿を削除（管理者用）
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // 投稿の存在確認
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '投稿が見つかりません'
      });
    }

    // 投稿を削除
    await post.destroy();

    res.json({
      success: true,
      message: '投稿を削除しました'
    });
  } catch (error) {
    console.error('投稿削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '投稿の削除に失敗しました'
    });
  }
};

/**
 * 投稿に「参考になった」を追加
 */
exports.addHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 投稿の存在確認
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '投稿が見つかりません'
      });
    }
    
    // helpfulCountをインクリメント
    post.helpfulCount = (post.helpfulCount || 0) + 1;
    await post.save();
    
    res.json({
      success: true,
      helpfulCount: post.helpfulCount
    });
  } catch (error) {
    console.error('参考になった追加エラー:', error);
    res.status(500).json({
      success: false,
      message: '参考になったの追加に失敗しました'
    });
  }
}; 