const { User } = require('../../models');
const path = require('path');
const fs = require('fs');

// ドキュメントのアップロード処理
exports.uploadDocument = async (req, res) => {
  try {
    // ファイルがアップロードされていない場合
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ファイルがアップロードされていません'
      });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      // アップロードされたファイルを削除
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    // 既存のファイルがある場合は削除
    if (user.documentPath) {
      const oldFilePath = path.join(__dirname, '../../../public', user.documentPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // ドキュメント情報の更新
    const documentPath = `/uploads/documents/${req.file.filename}`;
    
    await user.update({
      documentStatus: 'submitted',
      documentSubmittedAt: new Date(),
      documentPath: documentPath
    });

    res.json({
      success: true,
      message: '書類がアップロードされました',
      data: {
        documentStatus: user.documentStatus,
        documentSubmittedAt: user.documentSubmittedAt,
        documentPath: user.documentPath
      }
    });
  } catch (error) {
    console.error('書類アップロードエラー:', error);
    
    // エラー時にアップロードされたファイルがあれば削除
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: '書類のアップロードに失敗しました',
      error: error.message
    });
  }
};

// ドキュメントのステータス取得
exports.getDocumentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['documentStatus', 'documentSubmittedAt', 'documentVerifiedAt', 'documentRejectReason']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    res.json({
      success: true,
      data: {
        documentStatus: user.documentStatus,
        documentSubmittedAt: user.documentSubmittedAt,
        documentVerifiedAt: user.documentVerifiedAt,
        documentRejectReason: user.documentRejectReason,
        hasDocument: !!user.documentPath
      }
    });
  } catch (error) {
    console.error('書類ステータス取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '書類ステータスの取得に失敗しました',
      error: error.message
    });
  }
};

// ドキュメントの削除（再提出のため）
exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    // ドキュメントが存在しない場合
    if (!user.documentPath) {
      return res.status(400).json({
        success: false,
        message: '削除する書類が見つかりません'
      });
    }

    // ドキュメントが承認済みの場合は削除できない
    if (user.documentStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: '承認済みの書類は削除できません'
      });
    }

    // ファイルを削除
    const filePath = path.join(__dirname, '../../../public', user.documentPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ドキュメント情報をリセット
    await user.update({
      documentStatus: 'not_submitted',
      documentSubmittedAt: null,
      documentPath: null,
      documentRejectReason: null
    });

    res.json({
      success: true,
      message: '書類が削除されました'
    });
  } catch (error) {
    console.error('書類削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '書類の削除に失敗しました',
      error: error.message
    });
  }
}; 