document.addEventListener('DOMContentLoaded', function() {
    // カテゴリー一覧を取得
    async function loadCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            const data = await response.json();
            
            if (data.success) {
                const categoryList = document.getElementById('categoryList');
                categoryList.innerHTML = data.data.map(category => `
                    <div class="col-md-4 mb-4">
                        <div class="card category-card">
                            <div class="card-body">
                                <h5 class="card-title">${category.name}</h5>
                                <p class="card-text">${category.description || '説明なし'}</p>
                                <p class="thread-count">スレッド数: ${category.threadCount}</p>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editCategory('${category.id}')">
                                        <i class="bi bi-pencil"></i> 編集
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${category.id}')">
                                        <i class="bi bi-trash"></i> 削除
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('カテゴリー一覧の取得に失敗:', error);
            alert('カテゴリー一覧の取得に失敗しました');
        }
    }

    // カテゴリーを保存
    async function saveCategory() {
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;

        try {
            const url = id 
                ? `http://localhost:3000/api/admin/categories/${id}`
                : 'http://localhost:3000/api/admin/categories';
            
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name, description })
            });

            const data = await response.json();
            
            if (data.success) {
                bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                loadCategories();
            } else {
                alert(data.error || 'カテゴリーの保存に失敗しました');
            }
        } catch (error) {
            console.error('カテゴリーの保存に失敗:', error);
            alert('カテゴリーの保存に失敗しました');
        }
    }

    // カテゴリーを編集
    window.editCategory = async function(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/categories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('categoryId').value = data.data.id;
                document.getElementById('categoryName').value = data.data.name;
                document.getElementById('categoryDescription').value = data.data.description || '';
                document.getElementById('modalTitle').textContent = 'カテゴリーを編集';
                
                new bootstrap.Modal(document.getElementById('categoryModal')).show();
            } else {
                alert(data.error || 'カテゴリー情報の取得に失敗しました');
            }
        } catch (error) {
            console.error('カテゴリー情報の取得に失敗:', error);
            alert('カテゴリー情報の取得に失敗しました');
        }
    };

    // カテゴリーを削除
    window.deleteCategory = async function(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (data.success) {
                loadCategories();
            } else {
                alert(data.error || 'カテゴリーの削除に失敗しました');
            }
        } catch (error) {
            console.error('カテゴリーの削除に失敗:', error);
            alert('カテゴリーの削除に失敗しました');
        }
    };

    // イベントリスナーの設定
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    document.getElementById('categoryModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('modalTitle').textContent = '新規カテゴリー';
    });

    // 初期表示
    loadCategories();
}); 