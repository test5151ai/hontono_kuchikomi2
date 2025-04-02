const { User } = require('../models');

// スクリーンショットのアップロード
const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません' });
    }

    const userId = req.user.id;
    const filePath = `/uploads/${req.file.filename}`;

    // ユーザーのスクリーンショット情報を更新
    await User.update(
      {
        approvalScreenshot: filePath,
        isApproved: false // スクリーンショットアップロード時に承認状態をリセット
      },
      {
        where: { id: userId }
      }
    );

    res.json({
      message: 'スクリーンショットをアップロードしました',
      filePath
    });
  } catch (error) {
    console.error('Upload screenshot error:', error);
    res.status(500).json({ error: 'スクリーンショットのアップロードに失敗しました' });
  }
};

module.exports = {
  uploadScreenshot
}; 