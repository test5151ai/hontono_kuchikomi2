// APIベースURLの設定
function getBaseUrl() {
  // 現在のホスト名とプロトコルを取得
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // ローカル開発環境の場合
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 開発環境のポートを使用
    return `${protocol}//${hostname}:3000`;
  }
  
  // 本番環境の場合は相対パスを使用
  return '';
}

const API_BASE_URL = getBaseUrl();

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
    
    return API_BASE_URL + path;
} 