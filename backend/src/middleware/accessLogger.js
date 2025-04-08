const { AccessLog } = require('../models');

/**
 * アクセスログを記録するミドルウェア
 */
const accessLogger = async (req, res, next) => {
  try {
    // オリジナルのURLパスを保存
    const originalUrl = req.originalUrl;
    
    // リクエストメソッドを取得
    const method = req.method;
    
    // ユーザーIDを取得（認証済みの場合）
    const userId = req.user ? req.user.id : null;
    
    // User-Agentを取得
    const userAgent = req.get('User-Agent') || null;
    
    // IPアドレスを取得
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket.remoteAddress || null;
               
    // リファラーを取得
    const referer = req.get('Referer') || null;
    
    // スレッドIDの抽出（/api/threads/:threadId のようなパスから）
    let threadId = null;
    const threadMatch = originalUrl.match(/\/api\/threads\/([a-zA-Z0-9-]+)/);
    if (threadMatch && threadMatch[1]) {
      threadId = threadMatch[1];
    }
    
    // アクセスログを非同期で記録（リクエスト処理を遅延させないため）
    AccessLog.create({
      path: originalUrl,
      method,
      userId,
      threadId,
      userAgent,
      ip,
      referer
    }).catch(err => {
      console.error('アクセスログの記録に失敗:', err);
    });
    
    // 次のミドルウェアへ
    next();
  } catch (error) {
    console.error('アクセスログ記録中にエラーが発生:', error);
    // エラーがあってもリクエスト処理は継続
    next();
  }
};

module.exports = accessLogger; 