try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ログインに失敗しました');
    }

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/admin';
    } else {
        throw new Error('トークンが取得できませんでした');
    }
} catch (error) {
    console.error('Error logging in:', error);
    showError(error.message);
} 