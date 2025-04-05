const { User } = require('../../models');
const path = require('path');
const fs = require('fs');

// 書類の承認処理
exports.approveDocument = async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }
    
    // 書類がアップロードされていない場合
    if (user.documentStatus !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: '承認できる書類がありません'
      });
    }
    
    // 書類を承認済みに更新
    await user.update({
      documentStatus: 'approved',
      documentVerifiedAt: new Date(),
      documentVerifiedBy: adminId,
      documentRejectReason: null
    });
    
    res.json({
      success: true,
      message: '書類が承認されました',
      data: {
        userId: user.id,
        username: user.username,
        documentStatus: user.documentStatus,
        documentVerifiedAt: user.documentVerifiedAt
      }
    });
  } catch (error) {
    console.error('書類承認エラー:', error);
    res.status(500).json({
      success: false,
      message: '書類の承認に失敗しました',
      error: error.message
    });
  }
};

// 書類の拒否処理
exports.rejectDocument = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: '拒否理由を入力してください'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }
    
    // 書類がアップロードされていない場合
    if (user.documentStatus !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: '拒否できる書類がありません'
      });
    }
    
    // 書類を拒否に更新
    await user.update({
      documentStatus: 'rejected',
      documentVerifiedAt: new Date(),
      documentVerifiedBy: req.user.id,
      documentRejectReason: reason
    });
    
    res.json({
      success: true,
      message: '書類が拒否されました',
      data: {
        userId: user.id,
        username: user.username,
        documentStatus: user.documentStatus,
        documentRejectReason: user.documentRejectReason
      }
    });
  } catch (error) {
    console.error('書類拒否エラー:', error);
    res.status(500).json({
      success: false,
      message: '書類の拒否に失敗しました',
      error: error.message
    });
  }
};

// 書類の詳細取得
exports.getDocumentDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'username', 'email', 
        'documentStatus', 'documentSubmittedAt', 'documentVerifiedAt', 'documentRejectReason', 'documentPath'
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }
    
    // 書類がアップロードされていない場合
    if (!user.documentPath) {
      return res.status(404).json({
        success: false,
        message: 'このユーザーの書類は提出されていません'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        documentStatus: user.documentStatus,
        documentSubmittedAt: user.documentSubmittedAt,
        documentVerifiedAt: user.documentVerifiedAt,
        documentRejectReason: user.documentRejectReason,
        documentPath: user.documentPath
      }
    });
  } catch (error) {
    console.error('書類詳細取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '書類詳細の取得に失敗しました',
      error: error.message
    });
  }
}; 