// 管理者ダッシュボードのメインJavaScriptファイル

// APIエンドポイントの設定
const API_BASE_URL = window.API_CONFIG ? window.API_CONFIG.BASE_URL : '/api';
const ADMIN_API = {
    PENDING_USERS: `${API_BASE_URL}/admin/users/pending`,
    USERS: `${API_BASE_URL}/admin/users`,
    APPROVE_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/approve`,
    REJECT_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/reject`,
    BULK_APPROVE: `${API_BASE_URL}/admin/users/bulk-approve`,
    USER_DETAILS: (userId) => `${API_BASE_URL}/admin/users/${userId}/details`,
    THREADS: `${API_BASE_URL}/admin/threads`,
    CATEGORIES: `${API_BASE_URL}/admin/categories`
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
class AdminDashboard {
    constructor() {
        this.pendingUsers = [];
        this.selectedUsers = new Set();
        this.initializeEventListeners();
        this.loadPendingUsers();
        this.loadStatistics(); // 統計情報を読み込み
    }

    initializeEventListeners() {
        // 一括承認ボタン
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');
        if (bulkApproveBtn) {
            bulkApproveBtn.addEventListener('click', () => this.handleBulkApprove());
        }
        
        // 全選択チェックボックス
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    this.handleUserSelection(checkbox);
                });
            });
        }
    }

    async loadPendingUsers() {
        // pendingUsersTableBodyが存在しない場合は早期リターン
        if (!document.getElementById('pendingUsersTableBody')) {
            console.log('pendingUsersTableBody要素がないため、承認待ちユーザーの読み込みをスキップします');
            return;
        }
        
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
        if (!tableBody) {
            console.log('pendingUsersTableBody要素が見つからないため、表示をスキップします');
            return;
        }
        
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
        if (!tableContainer) {
            console.log('table-responsive要素が見つからないため、無限スクロールをスキップします');
            return;
        }
        
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
        const successToast = document.getElementById('successToast');
        if (!successToast) {
            console.log('successToast要素が見つからないため、成功通知をコンソールに表示します:', message);
            console.log('成功:', message);
            return;
        }
        
        const successToastBody = document.getElementById('successToastBody');
        if (!successToastBody) {
            console.log('successToastBody要素が見つからないため、成功通知をコンソールに表示します:', message);
            console.log('成功:', message);
            return;
        }
        
        const toast = new bootstrap.Toast(successToast);
        successToastBody.textContent = message;
        toast.show();
    }

    showError(message) {
        // Bootstrapのトースト通知を表示
        const errorToast = document.getElementById('errorToast');
        if (!errorToast) {
            console.log('errorToast要素が見つからないため、エラー通知をコンソールに表示します:', message);
            console.error('エラー:', message);
            return;
        }
        
        const errorToastBody = document.getElementById('errorToastBody');
        if (!errorToastBody) {
            console.log('errorToastBody要素が見つからないため、エラー通知をコンソールに表示します:', message);
            console.error('エラー:', message);
            return;
        }
        
        const toast = new bootstrap.Toast(errorToast);
        errorToastBody.textContent = message;
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

    // 統計情報を取得して表示
    async loadStatistics() {
        try {
            // ユーザー情報APIを使用して統計を取得
            const pendingResponse = await fetchWithAuth(ADMIN_API.PENDING_USERS);
            const usersResponse = await fetchWithAuth(ADMIN_API.USERS);
            // スレッド数を取得
            const threadsResponse = await fetchWithAuth(ADMIN_API.THREADS);
            // カテゴリーを取得
            const categoriesResponse = await fetchWithAuth(ADMIN_API.CATEGORIES);
            
            if (pendingResponse.success && usersResponse.success) {
                const pendingUsers = pendingResponse.data || [];
                const allUsers = usersResponse.data.users || [];
                
                // 重複を除いた全ユーザーリスト
                const combinedUsers = [...allUsers];
                pendingUsers.forEach(pUser => {
                    if (!combinedUsers.some(user => user.id === pUser.id)) {
                        combinedUsers.push(pUser);
                    }
                });
                
                // 統計データを計算
                const totalUsers = combinedUsers.length;
                const pendingCount = pendingUsers.filter(user => 
                    user.documentStatus === 'submitted' && (!user.isApproved || user.isApproved === false)).length;
                
                // 統計データを表示（数値が0の場合でも表示）
                document.getElementById('pendingUsersCount').textContent = pendingCount;
                document.getElementById('totalUsersCount').textContent = totalUsers;
                
                // スレッド数を表示（APIから取得）
                let threadsCount = 0;
                if (threadsResponse && threadsResponse.success && threadsResponse.pagination) {
                    threadsCount = threadsResponse.pagination.total || 0;
                    console.log('APIから取得したスレッド数:', threadsCount);
                }
                document.getElementById('totalThreadsCount').textContent = threadsCount;
                
                // カテゴリー数を表示（APIから取得）
                let categoriesCount = 0;
                if (categoriesResponse && categoriesResponse.success && categoriesResponse.data) {
                    categoriesCount = categoriesResponse.data.length || 0;
                    console.log('APIから取得したカテゴリー数:', categoriesCount);
                }
                document.getElementById('totalCategoriesCount').textContent = categoriesCount;
            } else {
                console.error('統計情報の取得に失敗:', pendingResponse.error || usersResponse.error);
                // エラーがあっても少なくとも0を表示
                document.getElementById('pendingUsersCount').textContent = '0';
                document.getElementById('totalUsersCount').textContent = '0';
                document.getElementById('totalThreadsCount').textContent = '0';
                document.getElementById('totalCategoriesCount').textContent = '0';
            }
        } catch (error) {
            console.error('統計情報の取得に失敗:', error);
            // エラー時には0を表示
            document.getElementById('pendingUsersCount').textContent = '0';
            document.getElementById('totalUsersCount').textContent = '0';
            document.getElementById('totalThreadsCount').textContent = '0';
            document.getElementById('totalCategoriesCount').textContent = '0';
        }
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
}); 