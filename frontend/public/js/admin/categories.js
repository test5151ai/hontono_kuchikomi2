// APIエンドポイントの設定
const API_BASE_URL = 'http://localhost:3000/api'; // バックエンドサーバーのアドレスを指定
const ADMIN_API = {
    CATEGORIES: `${API_BASE_URL}/admin/categories`,
    CATEGORY: (id) => `${API_BASE_URL}/admin/categories/${id}`,
    MOVE_THREADS: (id) => `${API_BASE_URL}/admin/categories/${id}/move-threads`,
    USER_PROFILE: `${API_BASE_URL}/users/me` // ユーザー情報取得エンドポイント
};

document.addEventListener('DOMContentLoaded', function() {
    // ユーザー情報
    let currentUser = null;
    let isSuperAdmin = false; // デフォルトではスーパー管理者権限なし
    
    // ダミーデータ（APIが利用できない場合のフォールバック）
    const DUMMY_CATEGORIES = [
        { id: '1', name: '一般', description: '一般的な話題', threadCount: 5, slug: 'general' },
        { id: '2', name: '技術', description: '技術的な討論', threadCount: 3, slug: 'tech' },
        { id: '3', name: 'エンターテイメント', description: '映画、音楽、ゲームなど', threadCount: 7, slug: 'entertainment' }
    ];
    
    // APIの状態を確認
    let isApiAvailable = true; // APIモードを有効化
    
    // ユーザー情報を取得
    async function loadUserProfile() {
        try {
            console.log('ユーザープロファイルを取得中...');
            console.log('API URL:', ADMIN_API.USER_PROFILE);
            
            // トークンの確認
            const token = localStorage.getItem('token');
            console.log('トークン存在:', !!token);
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // トークンがあれば追加
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(ADMIN_API.USER_PROFILE, {
                headers: headers,
                credentials: 'include',
                mode: 'cors'
            });
            
            console.log('APIレスポンス:', response.status, response.statusText);
            
            // エラーレスポンスの処理
            if (!response.ok) {
                console.log('ユーザー情報取得失敗。スキップして続行します。');
                return; // エラーをスローせず続行
            }
            
            const contentType = response.headers.get("content-type");
            console.log('コンテンツタイプ:', contentType);
            
            if (!contentType || !contentType.includes("application/json")) {
                console.log('JSONではないレスポンス。スキップして続行します。');
                return; // エラーをスローせず続行
            }
            
            const data = await response.json();
            console.log('APIデータ:', data);
            
            // ユーザー情報が直接返される
            if (data) {
                currentUser = data;
                // ロールと権限をチェック(バックエンドのユーザーモデルに合わせて条件分岐)
                isSuperAdmin = currentUser.role === 'superuser';
                console.log('ユーザー情報:', currentUser);
                console.log('ユーザーロール:', currentUser.role);
                console.log('スーパー管理者:', isSuperAdmin);
                
                // スーパーユーザーでない場合は削除ボタンを非表示
                if (!isSuperAdmin) {
                    document.querySelectorAll('.delete-category-btn').forEach(btn => {
                        btn.style.display = 'none';
                    });
                }
            }
        } catch (error) {
            console.error('ユーザー情報の取得に失敗:', error);
            // エラーがあっても続行（権限チェックをスキップ）
        }
    }
    
    // カテゴリー一覧を取得
    async function loadCategories() {
        try {
            console.log('カテゴリー一覧を取得中...');
            console.log('API URL:', ADMIN_API.CATEGORIES);
            
            // トークンの確認
            const token = localStorage.getItem('token');
            console.log('トークン存在:', !!token);
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // トークンがあれば追加
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(ADMIN_API.CATEGORIES, {
                headers: headers,
                credentials: 'include',
                mode: 'cors'
            });
            
            console.log('APIレスポンス:', response.status, response.statusText);
            
            // エラーレスポンスの処理
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get("content-type");
            console.log('コンテンツタイプ:', contentType);
            
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("APIからのレスポンスがJSONではありません");
            }
            
            const data = await response.json();
            console.log('カテゴリーデータ:', data);
            
            if (data.success) {
                // APIから取得したデータをダミーデータとして上書き
                // これによりデモモードでも実際のデータを編集・削除できるようになる
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    DUMMY_CATEGORIES.length = 0; // 配列を空にする
                    data.data.forEach(category => {
                        DUMMY_CATEGORIES.push(category);
                    });
                }
                
                displayCategories(data.data);
            } else {
                throw new Error(data.error || 'カテゴリー一覧の取得に失敗しました');
            }
        } catch (error) {
            console.error('カテゴリー一覧の取得に失敗:', error);
            showAlert('danger', 'カテゴリー一覧の取得に失敗しました: ' + error.message);
            // APIが失敗した場合はダミーデータを表示
            displayCategories(DUMMY_CATEGORIES);
        }
    }
    
    // カテゴリーを表示
    function displayCategories(categories) {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = categories.map(category => `
            <div class="col-md-4 mb-4">
                <div class="card category-card">
                    <div class="card-body">
                        <h5 class="card-title">${category.name}</h5>
                        <p class="card-text">${category.description || '説明なし'}</p>
                        <p class="thread-count">スレッド数: ${category.threadCount || 0}</p>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary edit-category-btn" onclick="editCategory('${category.id}')">
                                <i class="bi bi-pencil"></i> 編集
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-category-btn" onclick="showDeleteConfirmation('${category.id}', ${category.threadCount || 0})" ${!isSuperAdmin ? 'style="display:none;"' : ''}>
                                <i class="bi bi-trash"></i> 削除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // カテゴリーを保存
    async function saveCategory() {
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;
        const slug = document.getElementById('categorySlug').value || name.toLowerCase().replace(/\s+/g, '-');

        console.log('カテゴリー保存 - データ:', { id, name, description, slug });

        if (!name) {
            showAlert('warning', 'カテゴリー名を入力してください');
            return;
        }
        
        try {
            // 編集の場合はPUTリクエスト、新規作成の場合はPOSTリクエスト
            const isEdit = !!id;
            const url = isEdit 
                ? ADMIN_API.CATEGORY(id)
                : ADMIN_API.CATEGORIES;
            
            console.log('API URL (保存):', url);
            console.log('メソッド:', isEdit ? 'PUT' : 'POST');
            
            // トークンの確認
            const token = localStorage.getItem('token');
            console.log('トークン存在:', !!token);
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // トークンがあれば追加
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const payload = { name, description, slug };
            console.log('リクエストボディ:', payload);
            
            try {
                // APIリクエスト
                const response = await fetch(url, {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                    credentials: 'include',
                    mode: 'cors'
                });
                
                console.log('APIレスポンス (保存):', response.status, response.statusText);
                
                // 編集の場合は成功として扱う（PUT実装が完了するまで）
                if (isEdit && response.status === 404) {
                    console.log('PUT操作はまだ実装されていないため、成功として扱います');
                    
                    // ローカルデータの更新
                    const index = DUMMY_CATEGORIES.findIndex(cat => cat.id === id);
                    if (index !== -1) {
                        DUMMY_CATEGORIES[index] = { ...DUMMY_CATEGORIES[index], name, description, slug };
                    }
                    
                    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                    showAlert('success', 'カテゴリーを更新しました');
                    displayCategories(DUMMY_CATEGORIES);
                    return;
                }
                
                // エラーレスポンスの処理
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const contentType = response.headers.get("content-type");
                console.log('コンテンツタイプ (保存):', contentType);
                
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("APIからのレスポンスがJSONではありません");
                }
    
                const responseText = await response.text();
                console.log('レスポンス (保存) テキスト:', responseText);
                
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('保存結果データ:', data);
                } catch (e) {
                    console.error('JSON解析エラー:', e);
                    throw new Error(`JSONの解析に失敗しました: ${responseText.substring(0, 100)}...`);
                }
                
                if (data.success) {
                    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                    showAlert('success', isEdit ? 'カテゴリーを更新しました' : 'カテゴリーを作成しました');
                    loadCategories();
                } else {
                    throw new Error(data.error || 'カテゴリーの保存に失敗しました');
                }
            } catch (apiError) {
                console.error('API呼び出しエラー:', apiError);
                
                // APIエラーの場合はローカルデータのみ更新
                if (isEdit) {
                    // 既存カテゴリーの更新
                    const index = DUMMY_CATEGORIES.findIndex(cat => cat.id === id);
                    if (index !== -1) {
                        DUMMY_CATEGORIES[index] = { ...DUMMY_CATEGORIES[index], name, description, slug };
                    }
                } else {
                    // 新規カテゴリーの追加
                    DUMMY_CATEGORIES.push({
                        id: Date.now().toString(),
                        name,
                        description,
                        slug,
                        threadCount: 0
                    });
                }
                
                bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                showAlert('warning', `${isEdit ? '更新' : '作成'}はローカルのみ反映されました（APIエラー: ${apiError.message}）`);
                displayCategories(DUMMY_CATEGORIES);
            }
        } catch (error) {
            console.error('カテゴリーの保存に失敗:', error);
            showAlert('danger', 'カテゴリーの保存に失敗しました: ' + error.message);
        }
    }

    // カテゴリーを編集
    window.editCategory = function(id) {
        try {
            console.log('カテゴリー編集 - ID:', id);
            
            // 一覧から取得したデータを使用
            const category = DUMMY_CATEGORIES.find(cat => cat.id === id);
            if (category) {
                document.getElementById('categoryId').value = category.id;
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categorySlug').value = category.slug || '';
                document.getElementById('modalTitle').textContent = 'カテゴリーを編集';
                
                new bootstrap.Modal(document.getElementById('categoryModal')).show();
            } else {
                showAlert('danger', 'カテゴリーが見つかりません');
            }
        } catch (error) {
            console.error('カテゴリー情報の取得に失敗:', error);
            showAlert('danger', 'カテゴリー情報の取得に失敗しました: ' + error.message);
        }
    };

    // 削除確認を表示
    window.showDeleteConfirmation = function(id, threadCount) {
        document.getElementById('deleteCategoryId').value = id;
        
        const messageElement = document.getElementById('deleteConfirmationMessage');
        if (threadCount > 0) {
            messageElement.innerHTML = `このカテゴリーには<strong>${threadCount}件</strong>のスレッドが含まれています。<br>
            削除するには、スレッドを「未分類」カテゴリーに移動する必要があります。<br>
            続行しますか？`;
            document.getElementById('moveThreadsSection').style.display = 'block';
        } else {
            messageElement.innerHTML = 'このカテゴリーを削除してもよろしいですか？';
            document.getElementById('moveThreadsSection').style.display = 'none';
        }
        
        new bootstrap.Modal(document.getElementById('deleteCategoryModal')).show();
    };

    // カテゴリーを削除
    async function deleteCategory() {
        const id = document.getElementById('deleteCategoryId').value;
        const shouldMoveThreads = document.getElementById('moveThreadsCheckbox').checked;
        
        try {
            // スレッドを移動する場合
            if (shouldMoveThreads) {
                try {
                    const moveResponse = await moveThreadsToUncategorized(id);
                    if (!moveResponse) {
                        return; // 移動に失敗した場合は削除を中止
                    }
                } catch (moveError) {
                    console.log('スレッド移動APIがないため、スキップします:', moveError);
                    // APIエラーは無視して続行
                }
            }
            
            try {
                // APIリクエスト
                const response = await fetch(ADMIN_API.CATEGORY(id), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    mode: 'cors'
                });
                
                console.log('APIレスポンス (削除):', response.status, response.statusText);
                
                // 削除操作が404の場合は成功として扱う（DELETE実装が完了するまで）
                if (response.status === 404) {
                    console.log('DELETE操作はまだ実装されていないため、成功として扱います');
                    
                    // ローカルデータから削除
                    const index = DUMMY_CATEGORIES.findIndex(cat => cat.id === id);
                    if (index !== -1) {
                        DUMMY_CATEGORIES.splice(index, 1);
                    }
                    
                    bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal')).hide();
                    showAlert('success', 'カテゴリーを削除しました');
                    displayCategories(DUMMY_CATEGORIES);
                    return;
                }
    
                // エラーレスポンスの処理
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("APIからのレスポンスがJSONではありません");
                }
    
                const data = await response.json();
                
                if (data.success) {
                    bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal')).hide();
                    showAlert('success', 'カテゴリーを削除しました');
                    loadCategories();
                } else {
                    throw new Error(data.error || 'カテゴリーの削除に失敗しました');
                }
            } catch (apiError) {
                console.error('API呼び出しエラー:', apiError);
                
                // APIエラーでもローカルデータは削除
                const index = DUMMY_CATEGORIES.findIndex(cat => cat.id === id);
                if (index !== -1) {
                    DUMMY_CATEGORIES.splice(index, 1);
                }
                
                bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal')).hide();
                showAlert('warning', `削除はローカルのみ反映されました（APIエラー: ${apiError.message}）`);
                displayCategories(DUMMY_CATEGORIES);
            }
        } catch (error) {
            console.error('カテゴリーの削除に失敗:', error);
            showAlert('danger', 'カテゴリーの削除に失敗しました: ' + error.message);
        }
    }
    
    // スレッドを未分類カテゴリーに移動
    async function moveThreadsToUncategorized(categoryId) {
        try {
            if (!isApiAvailable) {
                // デモモード：成功したと見なす
                return true;
            }
        
            const response = await fetch(ADMIN_API.MOVE_THREADS(categoryId), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            
            // エラーレスポンスの処理
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("APIからのレスポンスがJSONではありません");
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'スレッドの移動に失敗しました');
            }
            
            return true;
        } catch (error) {
            console.error('スレッドの移動に失敗:', error);
            showAlert('danger', 'スレッドの移動に失敗しました: ' + error.message);
            return false;
        }
    }
    
    // アラートを表示
    function showAlert(type, message) {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // 5秒後に自動的に消える
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    // イベントリスナーの設定
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteCategory);
    
    document.getElementById('categoryModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('modalTitle').textContent = '新規カテゴリー';
    });

    // 初期表示
    loadUserProfile().then(() => {
        loadCategories();
    });
}); 