// アラートを表示する関数
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 既存のアラートがあれば削除
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // フォームの前にアラートを挿入
    const form = document.getElementById('registerForm');
    form.parentNode.insertBefore(alertDiv, form);
    
    // 5秒後に自動的に消える
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

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
            const response = await fetch(getApiUrl('auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    username: formData.get('nickname')
                })
            });

            const result = await response.json();

            if (response.status === 201) {
                // トークンをローカルストレージに保存
                localStorage.setItem('token', result.token);
                
                // 成功メッセージを表示
                showAlert('success', '登録が完了しました。プロフィール画像をアップロードしてください。書き込み機能は管理者の承認後に利用可能になります。');
                
                // プロフィールページにリダイレクト
                setTimeout(() => {
                    window.location.href = '/profile.html';
                }, 2000);
            } else {
                showAlert('danger', result.error || '登録に失敗しました。');
            }

        } catch (error) {
            // エラーメッセージを表示
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
}); 