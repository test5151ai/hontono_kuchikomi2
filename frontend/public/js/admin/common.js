/**
 * 管理者ダッシュボード共通JavaScript
 * 全ての管理者ページで使用される共通機能を提供します
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('common.js: DOMContentLoadedイベント発火');
    
    // 認証チェック
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('common.js: トークンが存在しないため、ログインページにリダイレクト');
        window.location.href = '/login.html';
        return;
    }
    console.log('common.js: 認証トークンを確認、トークンあり');

    // ログアウトボタンを探索
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('common.js: ログアウトボタン検索結果:', logoutBtn ? 'ボタン見つかりました' : 'ボタンが見つかりません');
    
    // ログアウトボタンのイベントリスナー設定（ヘッダー用）
    if (logoutBtn) {
        console.log('common.js: ログアウトボタンにイベントリスナーを設定');
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 別のID形式のログアウトボタンも探す (フォールバック)
    const altLogoutBtn = document.querySelector('.logout-btn, [data-action="logout"]');
    if (altLogoutBtn && !logoutBtn) {
        console.log('common.js: 代替ログアウトボタンを発見、イベントリスナーを設定');
        altLogoutBtn.addEventListener('click', handleLogout);
    }

    // script要素を使ってログアウト関数をグローバルに公開
    const script = document.createElement('script');
    script.textContent = `
        function globalLogout() {
            console.log('グローバルログアウト関数が呼び出されました');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
            return false;
        }
    `;
    document.head.appendChild(script);

    // ユーザー名表示を更新
    updateAdminInfo();
});

/**
 * ログアウト処理
 * トークンを削除してログインページにリダイレクトします
 */
function handleLogout(e) {
    console.log('common.js: ログアウト処理開始', e);
    if (e) {
        e.preventDefault();
    }
    
    if (confirm('ログアウトしますか？')) {
        console.log('common.js: ログアウト確認ダイアログでOKが選択されました');
        // ローカルストレージからトークンを削除
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        console.log('common.js: トークンを削除しました。ログインページにリダイレクトします');
        // ログインページにリダイレクト
        window.location.href = '/login.html';
    } else {
        console.log('common.js: ログアウトがキャンセルされました');
    }
}

/**
 * 管理者情報を更新
 * ヘッダーやサイドバーに管理者名を表示します
 */
function updateAdminInfo() {
    console.log('common.js: 管理者情報更新処理開始');
    const adminNameElement = document.getElementById('adminName');
    console.log('common.js: 管理者名要素:', adminNameElement ? '見つかりました' : '見つかりません');
    
    if (adminNameElement) {
        // JWTからユーザー情報を取得
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // JWTのペイロード部分を取得
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('common.js: トークンからペイロードを解析:', payload);
                
                // 管理者名を表示
                if (payload.nickname) {
                    adminNameElement.textContent = payload.nickname;
                    console.log('common.js: 管理者名を設定:', payload.nickname);
                }
            } catch (error) {
                console.error('common.js: トークンの解析に失敗:', error);
            }
        }
    }
}

/**
 * APIリクエストヘルパー関数
 * 認証トークンを含めたAPIリクエストを実行します
 */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('認証トークンがありません');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        ...options
    };

    try {
        const response = await fetch(url, defaultOptions);
        
        // 認証エラーの場合はログインページにリダイレクト
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
            throw new Error('認証エラー: 再ログインが必要です');
        }

        return response;
    } catch (error) {
        console.error('APIリクエストエラー:', error);
        throw error;
    }
} 