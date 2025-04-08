// 管理画面の共通機能を提供するJS

// DOMが完全に読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // サイドバーが読み込まれた後にログアウトボタンにイベントリスナーを設定
    const sidebarObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // ログアウトボタンが追加されたかチェック
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    // すでにイベントリスナーが設定されていないことを確認
                    logoutBtn.removeEventListener('click', handleLogout);
                    // イベントリスナーを追加
                    logoutBtn.addEventListener('click', handleLogout);
                    // 見つかったのでObserverを停止
                    sidebarObserver.disconnect();
                }
            }
        });
    });

    // サイドバーコンテナを監視
    const sidebarContainer = document.getElementById('sidebar');
    if (sidebarContainer) {
        sidebarObserver.observe(sidebarContainer, { childList: true, subtree: true });
    }
});

// ログアウト処理を行う関数
function handleLogout(event) {
    event.preventDefault();
    if (confirm('ログアウトしますか？')) {
        // ローカルストレージからトークンを削除
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // ログインページにリダイレクト
        window.location.href = '/login.html';
    }
} 