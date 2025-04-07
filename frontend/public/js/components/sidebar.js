// 人気スレッドサイドバーコンポーネント（既存）
class PopularThreadsSidebar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.loadPopularThreads();
    }

    render() {
        this.innerHTML = `
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-white py-2">
                    <h3 class="h5 mb-0">人気スレッド</h3>
                </div>
                <div class="card-body p-0" id="popular-threads-container">
                    <div class="skeleton-loading p-3">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line w-75"></div>
                        <div class="skeleton-line w-50"></div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadPopularThreads() {
        try {
            const apiUrlString = getApiUrl('threads/popular');
            const apiUrl = new URL(apiUrlString, window.location.origin);
            console.log('人気スレッド取得URL:', apiUrl.toString());
            
            const response = await fetch(apiUrl);
            const popularThreads = await response.json();
            
            console.log('人気スレッド取得結果:', popularThreads);
            
            // 現在のスレッドIDを取得
            const urlParams = new URLSearchParams(window.location.search);
            const threadId = urlParams.get('id');
            
            // カテゴリーIDを取得（カテゴリーページの場合）
            const categoryId = urlParams.get('id');
            const isCategory = window.location.pathname.includes('category.html');
            
            // 人気スレッドを表示
            const popularThreadsContainer = document.getElementById('popular-threads-container');
            
            const popularThreadsHtml = `
                <ul class="list-group list-group-flush">
                    ${popularThreads && popularThreads.length > 0 ? 
                        popularThreads.map(thread => `
                            <li class="list-group-item py-2 border-bottom">
                                <a href="/thread.html?id=${thread.id}" class="d-block text-truncate mb-1 fw-medium ${thread.id === threadId ? 'text-primary' : ''}">
                                    ${thread.title}
                                </a>
                                <div class="d-flex justify-content-between align-items-center small text-muted" style="font-size: 0.75rem;">
                                    <span class="text-truncate me-2">${thread.category ? thread.category.name : '不明'}</span>
                                    <span class="flex-shrink-0"><i class="far fa-comment me-1"></i>${thread.postCount || 0}件</span>
                                </div>
                            </li>
                        `).join('') : 
                        '<li class="list-group-item py-2 text-center">人気スレッドがありません</li>'
                    }
                </ul>
            `;
            
            popularThreadsContainer.innerHTML = popularThreadsHtml;
        } catch (error) {
            console.error('人気スレッドの取得に失敗しました:', error);
            const popularThreadsContainer = document.getElementById('popular-threads-container');
            popularThreadsContainer.innerHTML = '<div class="alert alert-danger p-3">人気スレッドの取得に失敗しました。</div>';
        }
    }
}

// サイト全体のサイドバーコンポーネント（新規）
class SiteSidebar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.loadContent();
    }

    render() {
        // 現在のページの情報を取得
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const isPopularPage = urlParams.has('popular') && urlParams.get('popular') === 'true';
        
        // 人気スレッドサイドバーを表示するかどうか
        const showPopularThreads = !(currentPath.includes('threads.html') && isPopularPage);
        
        // 最新スレッドを表示するかどうか（人気スレッドページの場合）
        const showLatestThreads = currentPath.includes('threads.html') && isPopularPage;
        
        this.innerHTML = `
            <div class="sidebar-container">
                <!-- 人気スレッドサイドバー（人気スレッドページでは非表示） -->
                ${showPopularThreads ? '<popular-threads-sidebar></popular-threads-sidebar>' : ''}
                
                <!-- 最新スレッド（人気スレッドページのみ表示） -->
                ${showLatestThreads ? `
                <div class="card shadow-sm mb-4" id="latest-threads-card">
                    <div class="card-header bg-white py-2">
                        <h3 class="h5 mb-0">最新スレッド</h3>
                    </div>
                    <div class="card-body p-0" id="latest-threads-container">
                        <div class="skeleton-loading p-3">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line w-75"></div>
                            <div class="skeleton-line w-50"></div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- カテゴリー一覧 -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-white py-2">
                        <h3 class="h5 mb-0">カテゴリー</h3>
                    </div>
                    <div class="card-body p-0" id="categories-container">
                        <div class="skeleton-loading p-3">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line w-75"></div>
                            <div class="skeleton-line w-50"></div>
                        </div>
                    </div>
                </div>
                
                <!-- スレッド作成ボタン -->
                <div class="card shadow-sm mb-4">
                    <div class="card-body p-3 text-center">
                        <p class="mb-3">新しいスレッドを作成しますか？</p>
                        <a href="/create-thread.html" class="btn btn-primary w-100">
                            <i class="fas fa-plus me-2"></i>スレッドを作成する
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadContent() {
        // カテゴリー一覧を読み込む
        this.loadCategories();
        
        // 最新スレッドを読み込む（人気スレッドページの場合）
        const urlParams = new URLSearchParams(window.location.search);
        const isPopularPage = urlParams.has('popular') && urlParams.get('popular') === 'true';
        if (window.location.pathname.includes('threads.html') && isPopularPage) {
            this.loadLatestThreads();
        }
    }
    
    // カテゴリー一覧を読み込む
    async loadCategories() {
        try {
            const apiUrlString = getApiUrl('categories');
            const apiUrl = new URL(apiUrlString, window.location.origin);
            console.log('カテゴリー一覧取得URL:', apiUrl.toString());
            
            const response = await fetch(apiUrl);
            const categories = await response.json();
            
            const categoriesContainer = document.getElementById('categories-container');
            
            if (!categories || categories.length === 0) {
                categoriesContainer.innerHTML = '<div class="p-3 text-center text-muted">カテゴリーがありません</div>';
                return;
            }
            
            let html = '<ul class="list-group list-group-flush">';
            
            categories.forEach(category => {
                html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-2">
                        <a href="/category.html?id=${category.id}" class="text-decoration-none w-100 d-flex justify-content-between align-items-center">
                            <span>${category.name}</span>
                            <span class="badge bg-secondary rounded-pill">${category.threadCount || 0}</span>
                        </a>
                    </li>
                `;
            });
            
            html += '</ul>';
            categoriesContainer.innerHTML = html;
            
        } catch (error) {
            console.error('カテゴリー一覧の取得に失敗しました:', error);
            const categoriesContainer = document.getElementById('categories-container');
            categoriesContainer.innerHTML = '<div class="alert alert-danger p-3">カテゴリー一覧の取得に失敗しました。</div>';
        }
    }
    
    // 最新スレッドを読み込む
    async loadLatestThreads() {
        try {
            const latestThreadsContainer = document.getElementById('latest-threads-container');
            if (!latestThreadsContainer) return;
            
            const apiUrlString = getApiUrl('threads');
            const apiUrl = new URL(apiUrlString, window.location.origin);
            
            // クエリパラメータの追加
            apiUrl.searchParams.append('sort', 'createdAt');
            apiUrl.searchParams.append('order', 'desc');
            apiUrl.searchParams.append('limit', 5);
            
            console.log('最新スレッド取得URL:', apiUrl.toString());
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            const latestThreads = data.threads;
            
            if (!latestThreads || latestThreads.length === 0) {
                latestThreadsContainer.innerHTML = '<div class="p-3 text-center text-muted">最新スレッドがありません</div>';
                return;
            }
            
            let html = '<ul class="list-group list-group-flush">';
            
            latestThreads.forEach(thread => {
                const createdDate = new Date(thread.createdAt);
                const formattedDate = `${createdDate.getFullYear()}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getDate().toString().padStart(2, '0')}`;
                
                html += `
                    <li class="list-group-item py-2 border-bottom">
                        <a href="/thread.html?id=${thread.id}" class="d-block text-truncate mb-1 fw-medium">
                            ${thread.title}
                        </a>
                        <div class="d-flex justify-content-between align-items-center small text-muted" style="font-size: 0.75rem;">
                            <span class="text-truncate me-2">${thread.category ? thread.category.name : '不明'}</span>
                            <span class="flex-shrink-0"><i class="far fa-calendar me-1"></i>${formattedDate}</span>
                        </div>
                    </li>
                `;
            });
            
            html += '</ul>';
            latestThreadsContainer.innerHTML = html;
            
        } catch (error) {
            console.error('最新スレッドの取得に失敗しました:', error);
            const latestThreadsContainer = document.getElementById('latest-threads-container');
            latestThreadsContainer.innerHTML = '<div class="alert alert-danger p-3">最新スレッドの取得に失敗しました。</div>';
        }
    }
}

// getApiUrl関数のバックアップ（config.jsが読み込めなかった場合用）
if (typeof getApiUrl !== 'function') {
    // APIベースURLの設定
    function getBaseUrl() {
        // 現在のホスト名とプロトコルを取得
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // ローカル開発環境の場合
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 開発環境のポートを使用
            return `${protocol}//${hostname}:3000`;
        }
        
        // 本番環境の場合はAPIドメインを使用
        return `${protocol}//${hostname}`;
    }

    const API_BASE_URL = getBaseUrl();

    // 環境に応じてAPIベースURLを設定
    function getApiUrl(path) {
        // パスが既に/で始まっていない場合は追加
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // パスが/apiで始まっていない場合は追加
        if (!path.startsWith('/api')) {
            path = '/api' + path;
        }
        
        return API_BASE_URL + path;
    }
}

// カスタム要素の定義
customElements.define('popular-threads-sidebar', PopularThreadsSidebar);
customElements.define('site-sidebar', SiteSidebar); 