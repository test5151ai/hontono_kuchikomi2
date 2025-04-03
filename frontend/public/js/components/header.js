class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <header class="site-header">
                <nav class="navbar navbar-expand-lg">
                    <div class="container">
                        <!-- サイトロゴ/タイトル -->
                        <a class="navbar-brand" href="/">
                            15ch.net
                        </a>

                        <!-- ハンバーガーメニュー -->
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>

                        <!-- ナビゲーションメニュー -->
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">ホーム</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/threads">スレッド一覧</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">このサイトについて</a>
                                </li>
                            </ul>

                            <!-- 認証メニュー -->
                            <div class="header-auth">
                                <a href="/login" class="btn btn-outline-light">ログイン</a>
                                <a href="/register" class="btn btn-primary">新規登録</a>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        `;
    }

    setupEventListeners() {
        // ログアウトボタンのイベントリスナー
        const logoutButton = this.querySelector('#logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogout();
            });
        }

        // ログイン状態の監視
        this.checkAuthState();
    }

    async checkAuthState() {
        const token = localStorage.getItem('token');
        const guestMenu = this.querySelector('.guest-menu');
        const userMenu = this.querySelector('.user-menu');
        const username = this.querySelector('.username');

        if (token) {
            guestMenu.style.display = 'none';
            userMenu.style.display = 'block';
            // ユーザー名を取得して表示（実装予定）
        } else {
            guestMenu.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    async handleLogout() {
        try {
            localStorage.removeItem('token');
            window.location.href = '/login';
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    }
}

customElements.define('site-header', Header); 