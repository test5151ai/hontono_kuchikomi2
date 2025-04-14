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

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                AuthService.saveToken(data.token);
                window.location.href = '/index.html';
            } else {
                showAlert(data.message || 'ログインに失敗しました', 'error');
            }
        } catch (error) {
            AuthService.handleError(error);
        }
    });
}); 