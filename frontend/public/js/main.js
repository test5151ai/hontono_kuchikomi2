// メインスクリプト
document.addEventListener('DOMContentLoaded', () => {
    // 初期化処理
    console.log('アプリケーションを初期化しました');
    
    // トップページの人気スレッドを読み込む
    loadPopularThreads();
    
    // トップページの新着スレッドを読み込む
    loadRecentThreads();
});

// 人気スレッドを読み込む関数
async function loadPopularThreads() {
    // popular-threads-containerが存在するかチェック（トップページのみ）
    const container = document.getElementById('popular-threads-container');
    if (!container) return;

    try {
        // APIから人気スレッドを取得
        const response = await fetch(getApiUrl('threads/popular?limit=4'));
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
            // 日付をフォーマット
            const updatedDate = new Date(thread.updatedAt);
            const formattedDate = `${updatedDate.getFullYear()}/${(updatedDate.getMonth() + 1).toString().padStart(2, '0')}/${updatedDate.getDate().toString().padStart(2, '0')}`;
            const formattedTime = `${updatedDate.getHours().toString().padStart(2, '0')}:${updatedDate.getMinutes().toString().padStart(2, '0')}`;
            
            html += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="thread-list popular-threads h-100">
                    <div class="thread-item">
                        <a href="/thread.html?id=${thread.id}" class="thread-title">${thread.title}</a>
                        <p class="thread-excerpt">カテゴリ：${thread.category ? thread.category.name : '不明'}</p>
                        <div class="thread-meta">
                            <span><i class="far fa-comment"></i>投稿数: ${thread.postCount || 0}</span>
                            <span><i class="far fa-clock"></i>${formattedDate} ${formattedTime}</span>
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

// 新着スレッドを読み込む関数
async function loadRecentThreads() {
    // recent-threads-containerが存在するかチェック（トップページのみ）
    const container = document.getElementById('recent-threads-container');
    if (!container) return;

    try {
        // APIから新着スレッドを取得（createdAtで降順ソート、最新4件）
        const response = await fetch(getApiUrl('threads?limit=4&sort=createdAt&order=desc'));
        if (!response.ok) {
            throw new Error('APIからのレスポンスが正常ではありません');
        }
        
        const data = await response.json();
        
        if (!data.threads || data.threads.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-4">新着スレッドはありません</div>';
            return;
        }
        
        // 新着スレッドのHTMLを生成
        let html = '';
        
        data.threads.forEach(thread => {
            // 日付をフォーマット
            const createdDate = new Date(thread.createdAt);
            const formattedDate = `${createdDate.getFullYear()}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getDate().toString().padStart(2, '0')}`;
            const formattedTime = `${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;
            
            // 投稿の年月日が今日と同じ場合は時分のみ表示、それ以外は年月日を表示
            const today = new Date();
            const isToday = createdDate.getDate() === today.getDate() && 
                           createdDate.getMonth() === today.getMonth() && 
                           createdDate.getFullYear() === today.getFullYear();
            
            const timeDisplay = isToday ? formattedTime : formattedDate;
            
            html += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="thread-list h-100">
                    <div class="thread-item">
                        <a href="/thread.html?id=${thread.id}" class="thread-title">${thread.title}</a>
                        <p class="thread-excerpt">カテゴリ：${thread.category ? thread.category.name : '不明'}</p>
                        <div class="thread-meta">
                            <span><i class="far fa-clock"></i>${timeDisplay}</span>
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
        console.error('新着スレッドの取得に失敗しました:', error);
        container.innerHTML = '<div class="col-12 alert alert-danger">新着スレッドの読み込みに失敗しました。</div>';
    }
} 