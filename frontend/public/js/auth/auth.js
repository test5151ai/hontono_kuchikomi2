// 認証関連の共通処理
const AuthService = {
    // トークンの保存
    saveToken: (token) => {
        localStorage.setItem('authToken', token);
    },

    // トークンの取得
    getToken: () => {
        return localStorage.getItem('authToken');
    },

    // トークンの削除
    removeToken: () => {
        localStorage.removeItem('authToken');
    },

    // ログイン状態の確認
    isLoggedIn: () => {
        return !!localStorage.getItem('authToken');
    },

    // 共通のエラーハンドリング
    handleError: (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    this.removeToken();
                    window.location.href = '/login.html';
                    break;
                case 403:
                    showAlert('アクセス権限がありません', 'error');
                    break;
                default:
                    showAlert(error.response.data.message || 'エラーが発生しました', 'error');
            }
        } else {
            showAlert('ネットワークエラーが発生しました', 'error');
        }
    }
};

// セッション管理
const SessionManager = {
    init: () => {
        // ページ読み込み時にセッション状態を確認
        if (!AuthService.isLoggedIn() && !window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
    },

    refresh: async () => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                AuthService.saveToken(data.token);
            } else {
                AuthService.removeToken();
                window.location.href = '/login.html';
            }
        } catch (error) {
            AuthService.handleError(error);
        }
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    SessionManager.init();
}); 