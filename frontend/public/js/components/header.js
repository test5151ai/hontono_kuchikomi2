class SiteHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupAuthButtons();
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
                                <li class="nav-item">
                                    <a class="nav-link" href="/categories.html">カテゴリー一覧</a>
                                </li>
                            </ul>
                            <div class="auth-menu">
                                <div class="guest-menu">
                                    <a href="/login.html" class="btn btn-outline-light">ログイン</a>
                                    <a href="/register-guide.html" class="btn btn-primary">新規登録</a>
                                </div>
                                <div class="user-menu" style="display: none;">
                                    <a href="/profile.html" class="btn btn-outline-light">
                                        <i class="fas fa-user me-2"></i>マイページ
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
        } else {
            guestMenu.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }
}

customElements.define('site-header', SiteHeader); 