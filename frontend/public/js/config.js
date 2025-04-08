/**
 * 環境に応じたAPIベースURLを設定するための設定ファイル
 * 開発環境と本番環境で適切なURLを自動的に選択します
 */

// APIのベースURL設定
const getApiBaseUrl = () => {
  // 本番環境かどうかをURLのホスト名で判断
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api'; // 開発環境
  } else {
    return '/api'; // 本番環境
  }
};

// グローバル変数としてエクスポート
window.API_CONFIG = {
  BASE_URL: getApiBaseUrl()
};

console.log('API設定を読み込みました:', window.API_CONFIG.BASE_URL);

// 環境に応じてAPIベースURLを設定
function getApiUrl(path) {
    // パスが既に/で始まっていない場合は追加
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    // パスが/apiで始まっていない場合は追加
    if (!path.startsWith('/api')) {
        path = '/api' + path;
    }
    
    return window.API_CONFIG.BASE_URL + path;
} 