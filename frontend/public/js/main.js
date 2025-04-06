// メインスクリプト
document.addEventListener('DOMContentLoaded', () => {
    // 初期化処理
    console.log('アプリケーションを初期化しました');
    
    // トップページの人気スレッドを読み込む
    loadPopularThreads();
});

// 人気スレッドを読み込む関数
async function loadPopularThreads() {
    // popular-threads-containerが存在するかチェック（トップページのみ）
    const container = document.getElementById('popular-threads-container');
    if (!container) return;

    try {
        // APIから人気スレッドを取得
        const response = await fetch('http://localhost:3000/api/threads/popular?limit=4');
        if (!response.ok) {
            throw new Error('APIからのレスポンスが正常ではありません');
        }
        
        const popularThreads = await response.json();
        
        if (!popularThreads || popularThreads.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-4">人気スレッドはありません</div>';
            return;
        }
        
        // 人気スレッドのHTMLを生成
        let html = '';
        
        popularThreads.forEach(thread => {
            // スレッドの内容の短い抜粋を作成（最初の50文字）
            let excerpt = '内容の読み込みに失敗しました。';
            
            html += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="thread-list popular-threads h-100">
                    <div class="thread-item">
                        <a href="/thread.html?id=${thread.id}" class="thread-title">${thread.title}</a>
                        <p class="thread-excerpt">カテゴリ：${thread.category ? thread.category.name : '不明'}</p>
                        <div class="thread-meta">
                            <span><i class="far fa-comment"></i>投稿数: ${thread.postCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        });
        
        // コンテナにHTMLを設定
        container.innerHTML = html;
        
    } catch (error) {
        console.error('人気スレッドの取得に失敗しました:', error);
        container.innerHTML = '<div class="col-12 alert alert-danger">人気スレッドの読み込みに失敗しました。</div>';
    }
} 