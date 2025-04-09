// 環境設定から取得するAPIベースURL
const API_BASE_URL = window.API_CONFIG ? window.API_CONFIG.BASE_URL : '/api';
const STATIC_BASE_URL = window.location.origin;

// デバッグ情報
console.log('🔌 スレッド管理APIベースURL:', API_BASE_URL);
console.log('🔌 静的コンテンツURL:', STATIC_BASE_URL);

document.addEventListener('DOMContentLoaded', function() {
    // 認証チェック
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // URLからthreadIdを取得
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get('id');

    // スレッド一覧を取得
    async function loadThreads() {
        try {
            const loadingSpinner = document.getElementById('loading-spinner');
            if (loadingSpinner) loadingSpinner.classList.remove('d-none');
            
            const response = await fetch(`${API_BASE_URL}/admin/threads`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'スレッド一覧の取得に失敗しました');
            }
            
            const threadList = document.getElementById('threadList');
            threadList.innerHTML = data.threads.map(thread => `
                <tr>
                    <td>${thread.title}</td>
                    <td>${thread.category ? thread.category.name : '未分類'}</td>
                    <td>${new Date(thread.createdAt).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-thread" data-id="${thread.id}">
                            <i class="fas fa-edit"></i> 編集
                        </button>
                        <button class="btn btn-sm btn-danger delete-thread" data-id="${thread.id}">
                            <i class="fas fa-trash"></i> 削除
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // イベントリスナーを設定
            setupEventListeners();
            
        } catch (error) {
            console.error('スレッド一覧の取得に失敗:', error);
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.textContent = error.message || 'スレッド一覧の取得に失敗しました';
            document.querySelector('.container').prepend(alert);
        } finally {
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
        }
    }
    
    // イベントリスナーを設定
    function setupEventListeners() {
        // 編集ボタン
        document.querySelectorAll('.edit-thread').forEach(button => {
            button.addEventListener('click', function() {
                const threadId = this.dataset.id;
                editThread(threadId);
            });
        });
        
        // 削除ボタン
        document.querySelectorAll('.delete-thread').forEach(button => {
            button.addEventListener('click', function() {
                const threadId = this.dataset.id;
                if (confirm('このスレッドを削除してもよろしいですか？関連する投稿もすべて削除されます。')) {
                    deleteThread(threadId);
                }
            });
        });
    }
    
    // スレッド編集モーダルを表示
    async function editThread(threadId) {
        try {
            const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('スレッド情報の取得に失敗しました');
            }
            
            const thread = await response.json();
            
            // カテゴリ一覧を取得
            const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
            const categories = await categoriesResponse.json();
            
            // モーダルの内容を設定
            document.getElementById('threadId').value = thread.id;
            document.getElementById('threadTitle').value = thread.title;
            
            const categorySelect = document.getElementById('threadCategory');
            categorySelect.innerHTML = categories.map(category => `
                <option value="${category.id}" ${thread.categoryId === category.id ? 'selected' : ''}>
                    ${category.name}
                </option>
            `).join('');
            
            // モーダルを表示
            const modal = new bootstrap.Modal(document.getElementById('threadModal'));
            modal.show();
            
        } catch (error) {
            console.error('スレッド編集の準備に失敗:', error);
            alert(error.message || 'スレッド編集の準備に失敗しました');
        }
    }
    
    // スレッドを更新
    async function updateThread(event) {
        event.preventDefault();
        
        const form = event.target;
        const threadId = document.getElementById('threadId').value;
        const title = document.getElementById('threadTitle').value;
        const categoryId = document.getElementById('threadCategory').value;
        
        try {
            const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, categoryId })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'スレッドの更新に失敗しました');
            }
            
            // モーダルを閉じる
            bootstrap.Modal.getInstance(document.getElementById('threadModal')).hide();
            
            // 成功メッセージを表示
            const alert = document.createElement('div');
            alert.className = 'alert alert-success alert-dismissible fade show';
            alert.innerHTML = `
                スレッドを更新しました
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="閉じる"></button>
            `;
            document.querySelector('.container').prepend(alert);
            
            // スレッド一覧を再読み込み
            loadThreads();
            
        } catch (error) {
            console.error('スレッド更新エラー:', error);
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.textContent = error.message || 'スレッドの更新に失敗しました';
            document.getElementById('modalAlerts').innerHTML = '';
            document.getElementById('modalAlerts').appendChild(alert);
        }
    }
    
    // スレッドを削除
    async function deleteThread(threadId) {
        try {
            const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'スレッドの削除に失敗しました');
            }
            
            // 成功メッセージを表示
            const alert = document.createElement('div');
            alert.className = 'alert alert-success alert-dismissible fade show';
            alert.innerHTML = `
                スレッドを削除しました
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="閉じる"></button>
            `;
            document.querySelector('.container').prepend(alert);
            
            // スレッド一覧を再読み込み
            loadThreads();
            
        } catch (error) {
            console.error('スレッド削除エラー:', error);
            alert(error.message || 'スレッドの削除に失敗しました');
        }
    }
    
    // フォーム送信イベントリスナー
    document.getElementById('threadForm').addEventListener('submit', updateThread);
    
    // ページ読み込み時にスレッド一覧を取得
    loadThreads();
}); 