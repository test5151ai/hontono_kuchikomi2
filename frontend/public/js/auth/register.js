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
            
            // APIエンドポイントを決定（ポート3000を直接指定）
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? `${window.location.protocol}//${window.location.hostname}:3000/api/auth/register`
                : '/api/auth/register';
                
            console.log('API呼び出し先:', apiUrl);
            
            // 登録データの準備
            const registerData = {
                username: formData.get('nickname'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            console.log('送信データ:', { 
                ...registerData, 
                password: registerData.password ? '********' : undefined 
            });
            
            // 登録APIを呼び出す
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            // レスポンスヘッダーを確認
            console.log('レスポンスステータス:', response.status);
            console.log('レスポンスヘッダー:', {
                'content-type': response.headers.get('content-type'),
                'x-powered-by': response.headers.get('x-powered-by')
            });

            const data = await response.json();
            console.log('レスポンスデータ:', data);

            if (!response.ok) {
                throw new Error(data.error || '登録処理中にエラーが発生しました');
            }

            if (data.token) {
                // トークンをローカルストレージに保存
                localStorage.setItem('token', data.token);
                
                // 成功メッセージを表示
                alert(data.message || '登録が完了しました。管理者の承認をお待ちください。');
                
                // マイページにリダイレクト
                window.location.href = '/profile.html';
            } else {
                throw new Error('トークンが返されませんでした');
            }

        } catch (error) {
            console.error('登録エラー:', error);
            // エラーメッセージを表示
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
}); 