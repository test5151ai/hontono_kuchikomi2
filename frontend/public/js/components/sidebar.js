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
            const response = await fetch('http://localhost:3000/api/threads/popular');
            const popularThreads = await response.json();
            
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
                                <a href="/thread.html?id=${thread.id}" class="d-block text-truncate mb-1 fw-medium ${thread.id === parseInt(threadId) ? 'text-primary' : ''}">
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

// カスタム要素の定義
customElements.define('popular-threads-sidebar', PopularThreadsSidebar); 