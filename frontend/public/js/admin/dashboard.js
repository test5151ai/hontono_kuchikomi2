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
        // トークンがない場合はログインページにリダイレクト
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
        const response = await fetch(url, defaultOptions);
        const data = await response.json();
        
        if (response.status === 401) {
            // 認証エラーの場合はログインページにリダイレクト
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
class AdminDashboard {
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
            this.showError('承認待ちユーザーの取得に失敗しました');
            console.error('Error loading pending users:', error);
        }
    }

    renderPendingUsers() {
        const tableBody = document.getElementById('pendingUsersTableBody');
        tableBody.innerHTML = '';

        this.pendingUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="user-checkbox" data-user-id="${user.id}">
                </td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.submissionMethod}</td>
                <td>${user.submissionContact}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <button class="btn btn-success btn-sm approve-btn" data-user-id="${user.id}">承認</button>
                    <button class="btn btn-danger btn-sm reject-btn" data-user-id="${user.id}">拒否</button>
                </td>
            `;

            // イベントリスナーの追加
            const checkbox = row.querySelector('.user-checkbox');
            checkbox.addEventListener('change', () => this.handleUserSelection(checkbox));

            const approveBtn = row.querySelector('.approve-btn');
            approveBtn.addEventListener('click', () => this.handleApprove(user.id));

            const rejectBtn = row.querySelector('.reject-btn');
            rejectBtn.addEventListener('click', () => this.handleReject(user.id));

            tableBody.appendChild(row);
        });

        // 無限スクロールの設定
        this.setupInfiniteScroll();
    }

    handleUserSelection(checkbox) {
        const userId = checkbox.dataset.userId;
        if (checkbox.checked) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
        
        // 一括承認ボタンの状態更新
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');
        bulkApproveBtn.disabled = this.selectedUsers.size === 0;
    }

    async handleApprove(userId) {
        try {
            await fetchWithAuth(ADMIN_API.APPROVE_USER(userId), { method: 'PUT' });
            this.showSuccess('ユーザーを承認しました');
            await this.loadPendingUsers();
        } catch (error) {
            this.showError('ユーザーの承認に失敗しました');
            console.error('Error approving user:', error);
        }
    }

    async handleReject(userId) {
        const reason = prompt('拒否理由を入力してください：');
        if (reason === null) return;

        try {
            await fetchWithAuth(ADMIN_API.REJECT_USER(userId), {
                method: 'PUT',
                body: JSON.stringify({ reason })
            });
            this.showSuccess('ユーザーを拒否しました');
            await this.loadPendingUsers();
        } catch (error) {
            this.showError('ユーザーの拒否に失敗しました');
            console.error('Error rejecting user:', error);
        }
    }

    async handleBulkApprove() {
        if (!confirm('選択したユーザーを一括承認しますか？')) return;

        try {
            await fetchWithAuth(ADMIN_API.BULK_APPROVE, {
                method: 'PUT',
                body: JSON.stringify({
                    userIds: Array.from(this.selectedUsers)
                })
            });
            this.showSuccess('選択したユーザーを一括承認しました');
            this.selectedUsers.clear();
            await this.loadPendingUsers();
        } catch (error) {
            this.showError('一括承認に失敗しました');
            console.error('Error bulk approving users:', error);
        }
    }

    setupInfiniteScroll() {
        const tableContainer = document.querySelector('.table-responsive');
        let page = 1;
        let loading = false;

        tableContainer.addEventListener('scroll', async () => {
            if (loading) return;

            const { scrollTop, scrollHeight, clientHeight } = tableContainer;
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                loading = true;
                try {
                    const nextPage = await fetchWithAuth(`${ADMIN_API.PENDING_USERS}?page=${++page}`);
                    if (nextPage.length > 0) {
                        this.pendingUsers = [...this.pendingUsers, ...nextPage];
                        this.renderPendingUsers();
                    }
                } catch (error) {
                    console.error('Error loading more users:', error);
                } finally {
                    loading = false;
                }
            }
        });
    }

    showSuccess(message) {
        // Bootstrapのトースト通知を表示
        const toast = new bootstrap.Toast(document.getElementById('successToast'));
        document.getElementById('successToastBody').textContent = message;
        toast.show();
    }

    showError(message) {
        // Bootstrapのトースト通知を表示
        const toast = new bootstrap.Toast(document.getElementById('errorToast'));
        document.getElementById('errorToastBody').textContent = message;
        toast.show();
    }

    // ユーザー詳細情報の取得
    async getUserDetails(userId) {
        try {
            const response = await fetchWithAuth(ADMIN_API.USER_DETAILS(userId));
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.showError('ユーザー詳細の取得に失敗しました');
            console.error('Error loading user details:', error);
            return null;
        }
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
}); 