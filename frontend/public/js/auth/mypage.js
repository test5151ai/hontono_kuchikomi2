document.addEventListener('DOMContentLoaded', async () => {
    // 要素の取得
    const userNickname = document.getElementById('userNickname');
    const userEmail = document.getElementById('userEmail');
    const userCreatedAt = document.getElementById('userCreatedAt');
    const userPosts = document.getElementById('userPosts');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    // ユーザー情報を取得
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        // デバッグ用：トークン情報の詳細確認
        console.log('=== トークン情報 ===');
        console.log('LocalStorageから取得したトークン:', token);
        console.log('トークンの長さ:', token.length);
        console.log('トークンにBearerが含まれているか:', token.includes('Bearer'));
        console.log('作成するAuthorizationヘッダー:', `Bearer ${token}`);

        const response = await fetch('http://localhost:3000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // デバッグ用：レスポンスの詳細確認
        console.log('=== ユーザー情報取得 ===');
        console.log('レスポンスステータス:', response.status);
        console.log('レスポンスヘッダー:', Object.fromEntries(response.headers));
        const userData = await response.json();
        console.log('レスポンスデータ:', userData);

        if (!response.ok) {
            throw new Error(userData.error || 'ユーザー情報の取得に失敗しました');
        }

        // プロフィール情報を表示
        userNickname.textContent = userData.username;
        userEmail.textContent = userData.email;
        userCreatedAt.textContent = new Date(userData.createdAt).toLocaleDateString('ja-JP');

        // 投稿履歴を取得
        const postsResponse = await fetch(`http://localhost:3000/api/users/me/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!postsResponse.ok) {
            throw new Error('投稿履歴の取得に失敗しました');
        }

        const postsData = await postsResponse.json();

        // 投稿履歴を表示
        if (postsData.length === 0) {
            userPosts.innerHTML = '<p class="text-muted">まだ投稿がありません</p>';
        } else {
            userPosts.innerHTML = postsData.map(post => `
                <div class="list-group-item">
                    <h4 class="h6 mb-1">${post.title}</h4>
                    <p class="mb-1">${post.content}</p>
                    <small class="text-muted">
                        投稿日時: ${new Date(post.createdAt).toLocaleString('ja-JP')}
                    </small>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('エラー:', error);
        alert(error.message);
    }

    // プロフィール編集ボタンのイベントリスナー
    editProfileBtn.addEventListener('click', () => {
        // TODO: プロフィール編集モーダルを表示
        alert('プロフィール編集機能は準備中です');
    });

    // ログアウトボタンのイベントリスナー
    logoutBtn.addEventListener('click', () => {
        if (confirm('ログアウトしますか？')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
        }
    });

    // アカウント削除ボタンのイベントリスナー
    deleteAccountBtn.addEventListener('click', () => {
        if (confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
            // TODO: アカウント削除APIを呼び出す
            alert('アカウント削除機能は準備中です');
        }
    });
}); 