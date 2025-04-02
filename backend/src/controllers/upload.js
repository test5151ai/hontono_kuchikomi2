const { User } = require('../models');

// スクリーンショットのアップロード
const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'ファイルがアップロードされていません' 
      });
    }

    const userId = req.user.id;
    const filePath = `/uploads/approval_screenshots/${req.file.filename}`;

    // ユーザーのスクリーンショット情報を更新
    await User.update(
      {
        approvalScreenshot: filePath,
        isApproved: false, // スクリーンショットアップロード時に承認状態をリセット
        approvedAt: null,  // 承認日時もリセット
        approvedBy: null   // 承認者情報もリセット
      },
      {
        where: { id: userId }
      }
    );

    res.json({
      success: true,
      message: 'スクリーンショットをアップロードしました',
      data: {
        filePath,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload screenshot error:', error);
    res.status(500).json({ 
      success: false,
      error: 'スクリーンショットのアップロードに失敗しました',
      message: error.message 
    });
  }
};

module.exports = {
  uploadScreenshot
}; 