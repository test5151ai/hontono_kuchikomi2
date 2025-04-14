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
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name')
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('登録が完了しました。ログインしてください。', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                showAlert(data.message || '登録に失敗しました', 'error');
            }
        } catch (error) {
            AuthService.handleError(error);
        }
    });
}); 