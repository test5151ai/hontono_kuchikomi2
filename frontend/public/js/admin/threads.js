document.addEventListener('DOMContentLoaded', function() {
    // 認証チェック
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // スレッド一覧を取得
    async function loadThreads() {
        try {
            const response = await fetch('http://localhost:3000/api/admin/threads', {
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
            const response = await fetch(`http://localhost:3000/api/threads/${threadId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('スレッド情報の取得に失敗しました');
            }
            
            const thread = await response.json();
            
            // カテゴリ一覧を取得
            const categoriesResponse = await fetch('http://localhost:3000/api/categories');
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
            const response = await fetch(`http://localhost:3000/api/threads/${threadId}`, {
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
            const response = await fetch(`http://localhost:3000/api/threads/${threadId}`, {
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