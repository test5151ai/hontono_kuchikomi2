/**
 * 環境に応じたAPIベースURLを設定するための設定ファイル
 * 開発環境と本番環境で適切なURLを自動的に選択します
 * 
 * 最終更新: 2024-07-13
 * バージョン: v1.0.6-debug1
 */

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! 重要：このファイルのAPIエンドポイント設定を変更しないでください !!!
// !!! APIは既に正しく動作しています                             !!!
// !!! バックエンドサーバーはポート3000で動作します               !!!
// !!! この設定を変更しないでください                            !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// ビルド情報（キャッシュ対策）
const CONFIG_VERSION = 'v1.0.6';
const CONFIG_BUILD_ID = 'debugv1-' + new Date().toISOString().split('T')[0];

// APIのベースURL設定
const getApiBaseUrl = () => {
  // 現在のプロトコルを取得（httpかhttps）
  const protocol = window.location.protocol;
  
  // バックエンドのポート設定
  const BACKEND_PORT = 3000; // 実際に使用しているポート
  const FRONTEND_PORT = window.location.port || '80'; // フロントエンドポート
  
  // ポート情報をコンソールに表示
  console.log('🔌 接続情報:');
  console.log('- フロントエンドポート:', FRONTEND_PORT);
  console.log('- バックエンドポート:', BACKEND_PORT);
  console.log('- ホスト:', window.location.hostname);
  
  // 本番環境かどうかをURLのホスト名で判断
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${protocol}//${window.location.hostname}:${BACKEND_PORT}/api`; // 開発環境
  } else {
    return '/api'; // 本番環境
  }
};

// グローバル変数としてエクスポート
window.API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  VERSION: CONFIG_VERSION,
  BUILD_ID: CONFIG_BUILD_ID,
  TIMESTAMP: new Date().toISOString()
};

console.log('API設定を読み込みました:', window.API_CONFIG.BASE_URL);
console.log('設定バージョン:', CONFIG_VERSION, '(', CONFIG_BUILD_ID, ')');

// 環境に応じてAPIベースURLを設定
window.getApiUrl = function(path) {
    // パスが既に/で始まっていない場合は追加
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    // BASE_URLはすでに/apiを含んでいるので、
    // パスから/apiプレフィックスを削除（もし存在する場合）
    if (path.startsWith('/api/')) {
        path = path.substring(4); // '/api/'の長さ(=4)を取り除く
    } else if (path === '/api') {
        path = ''; // パスが '/api' だけの場合は空文字に
    }
    
    // キャッシュ対策としてタイムスタンプを追加
    const cacheBuster = `_v=${CONFIG_BUILD_ID}`;
    const hasQueryString = path.includes('?');
    const separator = hasQueryString ? '&' : '?';
    
    return window.API_CONFIG.BASE_URL + path + separator + cacheBuster;
} 