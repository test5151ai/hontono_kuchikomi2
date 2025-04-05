// 管理者ダッシュボードのメインJavaScriptファイル

// APIエンドポイントの設定
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_API = {
    PENDING_USERS: `${API_BASE_URL}/admin/users/pending`,
    APPROVE_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/approve`,
    REJECT_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/reject`,
    BULK_APPROVE: `${API_BASE_URL}/admin/users/bulk-approve`,
    USER_DETAILS: (userId) => `${API_BASE_URL}/admin/users/${userId}/details`
};

// ユーティリティ関数
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// APIリクエストヘルパー
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('認証トークンが存在しません');
        window.location.href = '/login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        ...options
    };

    try {
        console.log('リクエスト送信:', {
            url,
            headers: defaultOptions.headers
        });

        const response = await fetch(url, defaultOptions);
        const data = await response.json();
        
        if (response.status === 401) {
            console.error('認証エラー:', data);
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }
        if (!response.ok) {
            throw new Error(data.error || `APIエラー: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('APIリクエストエラー:', error);
        throw error;
    }
};

// メイン機能
class PendingUsers {
    constructor() {
        this.pendingUsers = [];
        this.selectedUsers = new Set();
        this.initializeEventListeners();
        this.loadPendingUsers();
    }

    initializeEventListeners() {
        // 一括承認ボタン
        document.getElementById('bulkApproveBtn').addEventListener('click', () => this.handleBulkApprove());
        
        // 全選択チェックボックス
        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.handleUserSelection(checkbox);
            });
        });
    }

    async loadPendingUsers() {
        try {
            const response = await fetchWithAuth(ADMIN_API.PENDING_USERS);
            if (response.success) {
                this.pendingUsers = response.data;
                this.renderPendingUsers();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('承認待ちユーザーの取得に失敗:', error);
            alert('承認待ちユーザーの取得に失敗しました');
        }
    }

    renderPendingUsers() {
        const tableBody = document.getElementById('pendingUsersTable');
        tableBody.innerHTML = this.pendingUsers.map(user => `
            <tr>
                <td>
                    <input type="checkbox" class="user-checkbox form-check-input" 
                           data-user-id="${user.id}" 
                           onchange="pendingUsers.handleUserSelection(this)">
                </td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="pendingUsers.approveUser('${user.id}')">
                        <i class="bi bi-check-circle"></i> 承認
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="pendingUsers.rejectUser('${user.id}')">
                        <i class="bi bi-x-circle"></i> 拒否
                    </button>
                </td>
            </tr>
        `).join('');
    }

    handleUserSelection(checkbox) {
        const userId = checkbox.dataset.userId;
        if (checkbox.checked) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
    }

    async handleBulkApprove() {
        if (this.selectedUsers.size === 0) {
            alert('承認するユーザーを選択してください');
            return;
        }

        if (!confirm('選択したユーザーを承認しますか？')) {
            return;
        }

        try {
            const response = await fetchWithAuth(ADMIN_API.BULK_APPROVE, {
                method: 'POST',
                body: JSON.stringify({ userIds: Array.from(this.selectedUsers) })
            });

            if (response.success) {
                alert('選択したユーザーを承認しました');
                this.selectedUsers.clear();
                this.loadPendingUsers();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('一括承認に失敗:', error);
            alert('一括承認に失敗しました');
        }
    }

    async approveUser(userId) {
        if (!confirm('このユーザーを承認しますか？')) {
            return;
        }

        try {
            const response = await fetchWithAuth(ADMIN_API.APPROVE_USER(userId), {
                method: 'POST'
            });

            if (response.success) {
                alert('ユーザーを承認しました');
                this.loadPendingUsers();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('ユーザー承認に失敗:', error);
            alert('ユーザー承認に失敗しました');
        }
    }

    async rejectUser(userId) {
        if (!confirm('このユーザーを拒否しますか？')) {
            return;
        }

        try {
            const response = await fetchWithAuth(ADMIN_API.REJECT_USER(userId), {
                method: 'POST'
            });

            if (response.success) {
                alert('ユーザーを拒否しました');
                this.loadPendingUsers();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('ユーザー拒否に失敗:', error);
            alert('ユーザー拒否に失敗しました');
        }
    }
}

// インスタンスの作成
const pendingUsers = new PendingUsers(); 