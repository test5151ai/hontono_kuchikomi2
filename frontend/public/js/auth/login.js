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
            const response = await fetch('http://localhost:3000/api/auth/login', {
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

            if (!response.ok) {
                throw new Error(data.message || 'ログインに失敗しました');
            }

            // トークンを保存
            localStorage.setItem('token', data.token);
            if (rememberMe) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // ログイン成功後のリダイレクト
            window.location.href = '/';

        } catch (error) {
            // エラーメッセージを表示
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
}); 