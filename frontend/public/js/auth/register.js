document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const togglePasswordButton = document.getElementById('togglePassword');
    const toggleConfirmPasswordButton = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // パスワードの表示/非表示切り替え
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.querySelector('i').classList.toggle('fa-eye');
        togglePasswordButton.querySelector('i').classList.toggle('fa-eye-slash');
    });

    toggleConfirmPasswordButton.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPasswordButton.querySelector('i').classList.toggle('fa-eye');
        toggleConfirmPasswordButton.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // フォームのバリデーション
    const validateForm = (formData) => {
        const errors = [];
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const nickname = formData.get('nickname');

        if (!nickname || nickname.trim().length < 2) {
            errors.push('ニックネームは2文字以上で入力してください');
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('有効なメールアドレスを入力してください');
        }

        if (!password || password.length < 8) {
            errors.push('パスワードは8文字以上で入力してください');
        }

        if (password !== confirmPassword) {
            errors.push('パスワードが一致しません');
        }

        return errors;
    };

    // 登録フォームの送信処理
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const errors = validateForm(formData);

        if (errors.length > 0) {
            errorMessage.textContent = errors.join('\n');
            errorMessage.classList.remove('d-none');
            return;
        }

        try {
            // エラーメッセージをクリア
            errorMessage.classList.add('d-none');
            
            // 登録APIを呼び出す
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    nickname: formData.get('nickname')
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '登録に失敗しました');
            }

            // 登録成功後、自動ログイン
            localStorage.setItem('token', data.token);

            // プロフィールページにリダイレクト
            window.location.href = '/profile.html';

        } catch (error) {
            // エラーメッセージを表示
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
}); 