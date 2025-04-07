document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // パスワードの表示/非表示切り替え
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.querySelector('i').classList.toggle('fa-eye');
        togglePasswordButton.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // ログインフォームの送信処理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        try {
            // エラーメッセージをクリア
            errorMessage.classList.add('d-none');
            
            // ログインAPIを呼び出す
            const response = await fetch(getApiUrl('auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe
                })
            });

            const data = await response.json();

            // デバッグ用：詳細なレスポンス情報
            console.log('=== ログイン処理 ===');
            console.log('レスポンスステータス:', response.status);
            console.log('レスポンスヘッダー:', Object.fromEntries(response.headers));
            console.log('レスポンスデータ:', data);
            console.log('生のトークン:', data.token);

            if (!response.ok) {
                throw new Error(data.message || 'ログインに失敗しました');
            }

            // トークンのバリデーション
            if (!data.token || typeof data.token !== 'string' || data.token.includes('Bearer')) {
                throw new Error('無効なトークン形式です');
            }

            // 既存のデータをクリア
            localStorage.clear();

            // トークンを保存（Bearerプレフィックスなし）
            localStorage.setItem('token', data.token);
            
            // デバッグ用：保存確認
            console.log('=== トークン保存確認 ===');
            console.log('LocalStorageに保存したトークン:', localStorage.getItem('token'));
            console.log('トークンの長さ:', localStorage.getItem('token').length);

            if (rememberMe) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // ログイン成功後のリダイレクト
            window.location.href = '/profile.html';

        } catch (error) {
            // エラーメッセージを表示
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
}); 