class SiteHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupAuthButtons();
        this.loadCategories(); // カテゴリーの読み込み
    }

    render() {
        // 重要: ヘッダーの色は --primary-color (#2C3E50) を使用。勝手に変更禁止
        this.innerHTML = `
            <header class="site-header">
                <nav class="navbar navbar-expand-lg">
                    <div class="container">
                        <a class="navbar-brand" href="/">15ch.net</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="#" id="categoriesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        カテゴリー
                                    </a>
                                    <ul class="dropdown-menu" id="categories-menu" aria-labelledby="categoriesDropdown">
                                        <li><a class="dropdown-item" href="/categories.html">すべてのカテゴリー</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><span class="dropdown-item-text">読み込み中...</span></li>
                                    </ul>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/threads.html?popular=true">人気スレッド</a>
                                </li>
                                <li class="nav-item admin-nav-item" style="display: none;">
                                    <a class="nav-link" href="http://localhost:8080/admin/" target="_blank">管理画面</a>
                                </li>
                            </ul>
                            <div class="auth-menu">
                                <div class="guest-menu">
                                    <a href="/login.html" class="btn btn-outline-light">ログイン</a>
                                    <a href="/register-guide.html" class="btn btn-primary">新規登録</a>
                                </div>
                                <div class="user-menu" style="display: none;">
                                    <a href="/profile.html" class="btn btn-outline-light">
                                        <i class="fas fa-user me-2"></i>プロフィール
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        `;
    }

    setupAuthButtons() {
        const token = localStorage.getItem('token');
        const guestMenu = this.querySelector('.guest-menu');
        const userMenu = this.querySelector('.user-menu');

        if (token) {
            guestMenu.style.display = 'none';
            userMenu.style.display = 'block';
            
            // トークンからユーザー情報を取得して管理者メニューの表示判断
            this.checkAdminStatus();
        } else {
            guestMenu.style.display = 'block';
            userMenu.style.display = 'none';
            this.querySelector('.admin-nav-item').style.display = 'none';
        }
    }

    // 管理者権限のチェック
    async checkAdminStatus() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // JWTトークンをデコードして権限を確認（簡易版）
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return;
            
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // roleがadmin, superadmin, superuserのいずれかであれば管理者リンクを表示
            if (payload.role === 'admin' || payload.role === 'superadmin' || payload.role === 'superuser') {
                this.querySelector('.admin-nav-item').style.display = 'block';
            }
        } catch (error) {
            console.error('管理者権限の確認に失敗しました:', error);
        }
    }

    // カテゴリー一覧の読み込み
    async loadCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            const data = await response.json();
            
            const categories = Array.isArray(data) ? data : (data.categories || data.data || []);
            
            if (categories.length === 0) {
                return;
            }
            
            const categoriesMenu = this.querySelector('#categories-menu');
            
            // 読み込み中の表示を削除
            categoriesMenu.innerHTML = '<li><a class="dropdown-item" href="/categories.html">すべてのカテゴリー</a></li><li><hr class="dropdown-divider"></li>';
            
            // 最大5つのカテゴリーを表示
            categories.slice(0, 5).forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="/category.html?id=${category.id}">${category.name}</a>`;
                categoriesMenu.appendChild(li);
            });
            
            // 5つ以上ある場合は「もっと見る」リンクを追加
            if (categories.length > 5) {
                const li = document.createElement('li');
                li.innerHTML = '<hr class="dropdown-divider">';
                categoriesMenu.appendChild(li);
                
                const moreLi = document.createElement('li');
                moreLi.innerHTML = '<a class="dropdown-item" href="/categories.html">すべて表示 <i class="fas fa-angle-right ms-1"></i></a>';
                categoriesMenu.appendChild(moreLi);
            }
        } catch (error) {
            console.error('カテゴリー一覧の取得に失敗しました:', error);
            const categoriesMenu = this.querySelector('#categories-menu');
            categoriesMenu.innerHTML = '<li><a class="dropdown-item" href="/categories.html">すべてのカテゴリー</a></li>';
        }
    }
}

customElements.define('site-header', SiteHeader); 