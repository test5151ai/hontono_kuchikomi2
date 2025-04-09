/**
 * 管理画面の認証管理と初期化を行うスクリプト
 */

document.addEventListener('DOMContentLoaded', function() {
    // config.jsが読み込まれていることを確認
    if (typeof window.API_CONFIG === 'undefined') {
        console.error('API設定が読み込まれていません。config.jsを確認してください。');
    } else {
        console.log('API設定:', window.API_CONFIG);
    }

    checkAdminAuth();
});

/**
 * 管理者認証をチェック
 * トークンの有無と管理者権限の確認を行い、
 * 権限がない場合は管理者ログインページにリダイレクト
 */
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('現在のトークン:', token ? '存在します' : 'ありません');
    console.log('ユーザーロール:', userRole || 'なし');
    
    // ログインページの場合は処理をスキップ
    if (window.location.pathname.includes('/login.html')) {
        console.log('ログインページなのでチェックをスキップします');
        return;
    }
    
    if (!token) {
        // トークンがない場合は管理者ログインページへリダイレクト
        console.log('トークンがありません。管理者ログインページへリダイレクトします。');
        window.location.href = '/admin/login.html';
        return;
    }
    
    // 既に権限確認済みの場合はAPI呼び出しをスキップ
    if (userRole === 'admin' || userRole === 'superuser') {
        console.log('既に管理者権限が確認されています:', userRole);
        return;
    }
    
    // トークンがある場合はユーザー情報を取得して管理者権限をチェック
    // API_CONFIG.BASE_URLには既に/apiが含まれているため、パスから/apiプレフィックスを削除
    let meUrl = '/api/users/me';
    if (window.API_CONFIG) {
        // getApiUrl関数が定義されているか確認
        if (typeof window.getApiUrl === 'function') {
            meUrl = window.getApiUrl('/users/me');
        } else {
            // BASE_URLから/apiを削除してパスを結合
            const baseUrl = window.API_CONFIG.BASE_URL.endsWith('/api') 
                ? window.API_CONFIG.BASE_URL.slice(0, -4) 
                : window.API_CONFIG.BASE_URL;
            meUrl = `${baseUrl}/api/users/me`;
        }
    }
    console.log('ユーザー情報取得URL:', meUrl);
    
    fetch(meUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('認証レスポンス:', response.status);
        if (!response.ok) {
            throw new Error('認証エラー');
        }
        return response.json();
    })
    .then(user => {
        console.log('ユーザー情報:', user);
        // 管理者権限チェック
        if (user.role !== 'admin' && user.role !== 'superuser') {
            console.error('管理者権限がありません');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/admin/login.html?error=unauthorized';
            return;
        }
        console.log('管理者認証成功');
        localStorage.setItem('userRole', user.role);
        // ここで管理画面の初期化処理を行う
    })
    .catch(error => {
        console.error('認証チェックエラー:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '/admin/login.html?error=auth_failed';
    });
} 