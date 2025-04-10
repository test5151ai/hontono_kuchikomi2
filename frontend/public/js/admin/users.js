// 管理者ダッシュボードのメインJavaScriptファイル

// 環境設定から取得
const API_BASE_URL = window.API_CONFIG ? window.API_CONFIG.BASE_URL : '/api';
const STATIC_BASE_URL = window.location.origin;

// デバッグ情報
console.log('🔌 管理画面APIベースURL:', API_BASE_URL);
console.log('🔌 静的コンテンツURL:', STATIC_BASE_URL);

// APIエンドポイントの設定
const ADMIN_API = {
    USERS: `${API_BASE_URL}/admin/users`,
    PENDING_USERS: `${API_BASE_URL}/admin/users/pending`,
    APPROVE_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/approve`,
    REJECT_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/reject`,
    BULK_APPROVE: `${API_BASE_URL}/admin/users/bulk-approve`,
    USER_DETAILS: (userId) => `${API_BASE_URL}/admin/users/${userId}/details`,
    GET_DOCUMENT: (userId) => `${API_BASE_URL}/admin/users/${userId}/document`,
    APPROVE_DOCUMENT: (userId) => `${API_BASE_URL}/admin/users/${userId}/document/approve`,
    REJECT_DOCUMENT: (userId) => `${API_BASE_URL}/admin/users/${userId}/document/reject`
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
        this.allUsers = [];
        this.searchKeywords = {
            all: '',
            pending: '',
            approved: '',
            rejected: '',
            notSubmitted: '',
            admin: '' // 管理者タブ用の検索キーワード
        };
        this.selectedUsers = new Set();
        this.currentPages = {
            all: 1,
            pending: 1,
            approved: 1,
            rejected: 1,
            notSubmitted: 1,
            admin: 1 // 管理者タブ用のページ
        };
        this.limits = {
            all: 10,
            pending: 10,
            approved: 10,
            rejected: 10,
            notSubmitted: 10,
            admin: 10 // 管理者タブ用のリミット
        };
        this.sortFields = {
            all: 'createdAt',
            pending: 'createdAt',
            approved: 'createdAt',
            rejected: 'createdAt',
            notSubmitted: 'createdAt',
            admin: 'createdAt' // 管理者タブ用のソートフィールド
        };
        this.sortDirections = {
            all: 'desc',
            pending: 'desc',
            approved: 'desc',
            rejected: 'desc',
            notSubmitted: 'desc',
            admin: 'desc' // 管理者タブ用のソート方向
        };
        
        // イベントハンドラを初期化
        this.initializeEventHandlers();
    }

    // 既存ユーザーの初期化
    async init() {
        await this.loadUsers();
        this.renderPendingUsers();
        this.initializeSelectAllCheckboxes();
    }

    // イベントハンドラの初期化
    initializeEventHandlers() {
        // 全ユーザー検索
        document.getElementById('searchAll').addEventListener('input', e => {
            this.handleSearchInput(e, 'all');
        });
        document.getElementById('clearSearchAll').addEventListener('click', () => {
            this.clearSearch('all');
        });
        
        // 管理者タブ検索
        document.getElementById('searchAdmin').addEventListener('input', e => {
            this.handleSearchInput(e, 'admin');
        });
        document.getElementById('clearSearchAdmin').addEventListener('click', () => {
            this.clearSearch('admin');
        });
        
        // 承認待ち検索
        document.getElementById('searchPending').addEventListener('input', e => {
            this.handleSearchInput(e, 'pending');
        });
        document.getElementById('clearSearchPending').addEventListener('click', () => {
            this.clearSearch('pending');
        });
        
        // 承認済み検索
        document.getElementById('searchApproved').addEventListener('input', e => {
            this.handleSearchInput(e, 'approved');
        });
        document.getElementById('clearSearchApproved').addEventListener('click', () => {
            this.clearSearch('approved');
        });
        
        // 拒否済み検索
        document.getElementById('searchRejected').addEventListener('input', e => {
            this.handleSearchInput(e, 'rejected');
        });
        document.getElementById('clearSearchRejected').addEventListener('click', () => {
            this.clearSearch('rejected');
        });
        
        // 未提出検索
        document.getElementById('searchNotSubmitted').addEventListener('input', e => {
            this.handleSearchInput(e, 'notSubmitted');
        });
        document.getElementById('clearSearchNotSubmitted').addEventListener('click', () => {
            this.clearSearch('notSubmitted');
        });
        
        // ページネーションボタンイベント
        document.getElementById('all-prev').addEventListener('click', e => this.handlePaginationClick(e, 'all', 'prev'));
        document.getElementById('all-next').addEventListener('click', e => this.handlePaginationClick(e, 'all', 'next'));
        document.getElementById('admin-prev').addEventListener('click', e => this.handlePaginationClick(e, 'admin', 'prev'));
        document.getElementById('admin-next').addEventListener('click', e => this.handlePaginationClick(e, 'admin', 'next'));
        document.getElementById('pending-prev').addEventListener('click', e => this.handlePaginationClick(e, 'pending', 'prev'));
        document.getElementById('pending-next').addEventListener('click', e => this.handlePaginationClick(e, 'pending', 'next'));
        document.getElementById('approved-prev').addEventListener('click', e => this.handlePaginationClick(e, 'approved', 'prev'));
        document.getElementById('approved-next').addEventListener('click', e => this.handlePaginationClick(e, 'approved', 'next'));
        document.getElementById('rejected-prev').addEventListener('click', e => this.handlePaginationClick(e, 'rejected', 'prev'));
        document.getElementById('rejected-next').addEventListener('click', e => this.handlePaginationClick(e, 'rejected', 'next'));
        document.getElementById('notSubmitted-prev').addEventListener('click', e => this.handlePaginationClick(e, 'notSubmitted', 'prev'));
        document.getElementById('notSubmitted-next').addEventListener('click', e => this.handlePaginationClick(e, 'notSubmitted', 'next'));
        
        // ソートヘッダーのイベントハンドラ
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', e => {
                const field = th.dataset.sort;
                const tab = th.dataset.tab;
                this.handleSort(field, tab);
            });
        });
        
        // タブ切り替え時のイベント
        const tabEl = document.querySelector('#myTab button[data-bs-toggle="tab"]');
        tabEl.addEventListener('shown.bs.tab', event => {
            // タブが切り替わった時に再レンダリング
            this.renderAllUsersTabs();
        });
    }

    // フィルタリングしたユーザーリストを取得
    getFilteredUsers(tabId) {
        const keyword = this.searchKeywords[tabId].toLowerCase();
        
        // タブに応じて異なるフィルタリング条件を適用
        let filteredUsers = this.allUsers.filter(user => {
            // 検索キーワードでのフィルタリング
            const matchesKeyword = !keyword || 
                user.username?.toLowerCase().includes(keyword) || 
                user.email?.toLowerCase().includes(keyword);
                
            if (!matchesKeyword) return false;
            
            // タブ別のフィルタリング
            if (tabId === 'admin') {
                // 管理者タブ: 管理者(admin)とスーパー管理者(superuser)のみ表示
                return user.role === 'admin' || user.role === 'superuser';
            } else if (tabId === 'all') {
                // 全ユーザータブ: 管理者とスーパー管理者を除外
                return user.role === 'user';
            } else if (tabId === 'pending') {
                // 承認待ち: 提出済みで未承認のユーザー
                return !user.isApproved && user.documentStatus === 'submitted';
            } else if (tabId === 'approved') {
                // 承認済み: 承認済みのユーザー（管理者を除く）
                return user.isApproved && user.role === 'user';
            } else if (tabId === 'rejected') {
                // 拒否済み: 書類が拒否されたユーザー
                return user.documentStatus === 'rejected';
            } else if (tabId === 'notSubmitted') {
                // 未提出: 書類が未提出のユーザー
                return !user.documentSubmittedAt || user.documentStatus === 'not_submitted';
            }
            
            return true;
        });
        
        // ソート
        const sortField = this.sortFields[tabId];
        const sortDirection = this.sortDirections[tabId];
        
        filteredUsers.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            // null/undefinedの処理
            if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
            if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            
            // 日付の場合
            if (sortField === 'createdAt' || sortField === 'documentSubmittedAt' || sortField === 'lastLoginAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // 文字列の場合
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }
            
            // 数値・日付の場合
            return sortDirection === 'asc' ? (aValue - bValue) : (bValue - aValue);
        });
        
        return filteredUsers;
    }

    // すべてのタブにユーザーリストを表示
    renderAllUsersTabs() {
        // 各タブのユーザー数をカウント
        const adminUsers = this.allUsers.filter(user => user.role === 'admin' || user.role === 'superuser');
        const regularUsers = this.allUsers.filter(user => user.role === 'user');
        const pendingUsers = this.allUsers.filter(user => !user.isApproved && user.documentStatus === 'submitted');
        const approvedUsers = this.allUsers.filter(user => user.isApproved && user.role === 'user');
        const rejectedUsers = this.allUsers.filter(user => user.documentStatus === 'rejected');
        const notSubmittedUsers = this.allUsers.filter(user => !user.documentSubmittedAt || user.documentStatus === 'not_submitted');
        
        // バッジにユーザー数を表示
        document.getElementById('badge-all').textContent = regularUsers.length;
        document.getElementById('badge-admin').textContent = adminUsers.length;
        document.getElementById('badge-pending').textContent = pendingUsers.length;
        document.getElementById('badge-approved').textContent = approvedUsers.length;
        document.getElementById('badge-rejected').textContent = rejectedUsers.length;
        document.getElementById('badge-notSubmitted').textContent = notSubmittedUsers.length;
        
        // 各タブのテーブルを表示
        this.renderUserTable('pendingUsersTableAll', this.getFilteredUsers('all'));
        this.renderUserTable('pendingUsersTableAdmin', this.getFilteredUsers('admin'));
        this.renderUserTable('pendingUsersTableSubmitted', this.getFilteredUsers('pending'));
        this.renderUserTable('pendingUsersTableApproved', this.getFilteredUsers('approved'));
        this.renderUserTable('pendingUsersTableRejected', this.getFilteredUsers('rejected'));
        this.renderUserTable('pendingUsersTableNotSubmitted', this.getFilteredUsers('notSubmitted'));
    }

    async loadUsers() {
        try {
            // まず承認待ちユーザーを取得（旧APIを使用）
            const pendingResponse = await fetchWithAuth(ADMIN_API.PENDING_USERS);
            
            // 次に全ユーザーを取得
            const usersResponse = await fetchWithAuth(ADMIN_API.USERS);
            
            if (pendingResponse.success && usersResponse.success) {
                // 承認待ちユーザーは直接データを取得
                const pendingUsers = pendingResponse.data;
                
                // 全ユーザーはdata.usersから取得
                const allUsers = usersResponse.data.users;
                
                // 全ユーザーリストを作成
                this.pendingUsers = [...pendingUsers];
                
                // allUsersから重複しないユーザーを追加
                allUsers.forEach(user => {
                    if (!this.pendingUsers.some(pUser => pUser.id === user.id)) {
                        this.pendingUsers.push(user);
                    }
                });
                
                // 初期フィルタリング
                this.filterAllTabs();
                
                // 統計データの更新（グラフなしで）
                this.updateStatisticsData();
                
                // チャートを描画 - 統計ページに移動したためコメントアウト
                // this.renderCharts();
            } else {
                throw new Error(pendingResponse.error || usersResponse.error || 'データの取得に失敗しました');
            }
        } catch (error) {
            console.error('ユーザーの取得に失敗:', error);
            alert('ユーザーの取得に失敗しました');
        }
    }

    // 統計データのみを更新する（グラフ描画なし）
    updateStatisticsData() {
        const approved = this.pendingUsers.filter(user => user.isApproved === true).length;
        const pending = this.pendingUsers.filter(user => 
            user.documentStatus === 'submitted' && (!user.isApproved || user.isApproved === false)).length;
        const rejected = this.pendingUsers.filter(user => user.documentStatus === 'rejected').length;
        const notSubmitted = this.pendingUsers.filter(user => user.documentStatus === 'not_submitted').length;
        
        // 統計数値の更新
        document.getElementById('totalUsersCount').textContent = this.pendingUsers.length;
        document.getElementById('approvedUsersCount').textContent = approved;
        document.getElementById('pendingUsersCount').textContent = pending;
        document.getElementById('rejectedUsersCount').textContent = rejected;
    }
    
    // フィルタリング済みテーブルの描画
    renderFilteredTable(tabId) {
        const tableId = tabId === 'all' ? 'pendingUsersTable' : 
                        tabId === 'pending' ? 'pendingUsersTableSubmitted' :
                        tabId === 'approved' ? 'pendingUsersTableApproved' :
                        tabId === 'rejected' ? 'pendingUsersTableRejected' :
                        'pendingUsersTableNotSubmitted';
        
        this.renderUserTable(tableId, this.getFilteredUsers(tabId));
    }

    // ユーザーステータスの表示
    renderUserStatus(user) {
        // ユーザーが承認済みの場合
        if (user.isApproved === true) {
            return '<span class="badge bg-success">認証済</span>';
        }
        
        // ユーザーが拒否されている場合
        if (user.documentStatus === 'rejected') {
            const reason = user.documentRejectReason || '理由なし';
            return `<span class="badge bg-danger" onclick="pendingUsers.showRejectReasonModal('${user.id}', '${reason}')" style="cursor: pointer;">
                        拒否 <i class="bi bi-info-circle"></i>
                    </span>`;
        }
        
        // 書類が提出済みで承認待ちの場合
        if (user.documentStatus === 'submitted') {
            return '<span class="badge bg-warning">未認証</span>';
        }
        
        // 書類が未提出の場合
        return '<span class="badge bg-secondary">書類待ち</span>';
    }

    renderPendingUsers() {
        this.renderAllUsersTabs();
    }

    // 書類を表示
    async viewDocument(userId) {
        try {
            console.log('書類を表示します - ユーザーID:', userId);
            const response = await fetchWithAuth(ADMIN_API.GET_DOCUMENT(userId));
            
            console.log('書類データ取得結果:', response);
            
            if (response.success) {
                // 書類プレビューモーダルを表示
                this.showDocumentModal(response.data);
            } else {
                throw new Error(response.message || '書類の取得に失敗しました');
            }
        } catch (error) {
            console.error('書類表示エラー:', error);
            alert('書類の表示に失敗しました: ' + error.message);
        }
    }

    // 書類プレビューモーダルを表示
    showDocumentModal(documentData) {
        console.log('モーダルに表示する書類データ:', documentData);
        
        // 最新の書類を取得
        const latestDocument = documentData.documents && documentData.documents.length > 0 
            ? documentData.documents[0] 
            : null;
        
        if (!latestDocument) {
            alert('書類データが見つかりません');
            return;
        }
        
        // 画像パスの処理 - 相対パスの場合はベースURLを追加
        let imgPath = latestDocument.documentPath;
        if (imgPath && !imgPath.startsWith('http')) {
            imgPath = `${STATIC_BASE_URL}${imgPath}`;
        }
        
        console.log('表示する画像のパス:', imgPath);
        
        // モーダルHTML作成
        const modalHtml = `
            <div class="modal fade" id="documentModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">書類確認 - ${documentData.username}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="document-preview mb-3">
                                <img src="${imgPath}" class="img-fluid" alt="書類" 
                                     style="max-height: 500px; width: auto; margin: 0 auto; display: block;">
                            </div>
                            <div class="document-info">
                                <p><strong>書類名:</strong> ${latestDocument.documentName || '確認書類'}</p>
                                <p><strong>提出日時:</strong> ${formatDate(latestDocument.uploadedAt || documentData.documentSubmittedAt)}</p>
                                <p><strong>ステータス:</strong> ${this.renderUserStatus(documentData)}</p>
                                ${documentData.documentStatus === 'rejected' && documentData.documentRejectReason ? 
                                `<div class="alert alert-danger mt-2">
                                    <strong>拒否理由:</strong> ${documentData.documentRejectReason}
                                </div>` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" onclick="pendingUsers.approveDocument('${documentData.id}')">
                                承認
                            </button>
                            <button type="button" class="btn btn-danger" data-bs-toggle="collapse" data-bs-target="#rejectForm">
                                拒否
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                        <div class="collapse p-3" id="rejectForm">
                            <div class="mb-3">
                                <label for="rejectReason" class="form-label">拒否理由</label>
                                <textarea class="form-control" id="rejectReason" rows="3" placeholder="拒否理由を入力してください"></textarea>
                            </div>
                            <button class="btn btn-danger" onclick="pendingUsers.rejectDocument('${documentData.id}')">
                                拒否を確定
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('documentModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // モーダルをページに追加
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('documentModal'));
        modal.show();
    }

    // 書類を承認
    async approveDocument(userId) {
        try {
            const response = await fetchWithAuth(ADMIN_API.APPROVE_DOCUMENT(userId), {
                method: 'POST'
            });
            
            if (response.success) {
                alert('書類を承認しました');
                // モーダルを閉じる
                bootstrap.Modal.getInstance(document.getElementById('documentModal')).hide();
                // 一覧を更新
                await this.fetchUsers();
            } else {
                throw new Error(response.message || '書類の承認に失敗しました');
            }
        } catch (error) {
            console.error('書類承認エラー:', error);
            alert('書類の承認に失敗しました: ' + error.message);
        }
    }

    // 書類を拒否
    async rejectDocument(userId) {
        try {
            // 既存のフォームから理由を取得
            const reason = document.getElementById('rejectReason').value.trim();
            if (!reason) {
                alert('拒否理由を入力してください');
                return;
            }
            
            // モーダルを閉じる
            bootstrap.Modal.getInstance(document.getElementById('documentModal')).hide();
            
            const response = await fetchWithAuth(ADMIN_API.REJECT_DOCUMENT(userId), {
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            
            if (response.success) {
                alert('書類を拒否しました');
                // 一覧を更新
                await this.fetchUsers();
            } else {
                throw new Error(response.message || '書類の拒否に失敗しました');
            }
        } catch (error) {
            console.error('書類拒否エラー:', error);
            alert('書類の拒否に失敗しました: ' + error.message);
        }
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

        if (!confirm(`選択した ${this.selectedUsers.size} 人のユーザーを承認しますか？`)) {
            return;
        }

        try {
            const response = await fetchWithAuth(ADMIN_API.BULK_APPROVE, {
                method: 'POST',
                body: JSON.stringify({ userIds: Array.from(this.selectedUsers) })
            });

            if (response.success) {
                alert(`${this.selectedUsers.size}人のユーザーを承認しました`);
                this.selectedUsers.clear();
                await this.fetchUsers();
                
                // チェックボックスの選択状態をリセット
                document.querySelectorAll('.user-checkbox, #selectAllCheckbox, #selectAllPendingCheckbox, #selectAllRejectedCheckbox, #selectAllNotSubmittedCheckbox, #selectAllApprovedCheckbox').forEach(checkbox => {
                    checkbox.checked = false;
                });
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
                await this.fetchUsers();
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

        // モーダルで拒否理由を入力
        const rejectReasonModal = `
            <div class="modal fade" id="rejectReasonModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">ユーザー拒否理由</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="rejectReasonInput" class="form-label">拒否理由を入力してください</label>
                                <textarea class="form-control" id="rejectReasonInput" rows="3" 
                                    placeholder="ユーザーに通知される拒否理由を具体的に記入してください"></textarea>
                                <div class="form-text text-muted">
                                    ※拒否理由はユーザーに通知され、管理画面でも表示されます
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                            <button type="button" class="btn btn-danger" id="confirmRejectBtn">拒否を確定</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('rejectReasonModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // モーダルをページに追加
        document.body.insertAdjacentHTML('beforeend', rejectReasonModal);
        
        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('rejectReasonModal'));
        modal.show();
        
        // 拒否確定ボタンのイベントリスナー
        document.getElementById('confirmRejectBtn').addEventListener('click', async () => {
            const reason = document.getElementById('rejectReasonInput').value.trim();
            
            if (!reason) {
                alert('拒否理由を入力してください');
                return;
            }
            
            try {
                // モーダルを閉じる
                modal.hide();
                
                const response = await fetchWithAuth(ADMIN_API.REJECT_USER(userId), {
                    method: 'POST',
                    body: JSON.stringify({
                        reason: reason
                    })
                });
    
                if (response.success) {
                    alert('ユーザーを拒否しました');
                    // データを再読み込みして全てのタブを更新
                    await this.fetchUsers();
                } else {
                    throw new Error(response.error || response.message || '拒否処理に失敗しました');
                }
            } catch (error) {
                console.error('ユーザー拒否に失敗:', error);
                alert('ユーザー拒否に失敗しました: ' + error.message);
            }
        });
    }

    // 拒否理由モーダルを表示
    showRejectReasonModal(userId, reason) {
        // エスケープ処理
        const escapedReason = reason.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        
        // モーダルHTML作成
        const modalHtml = `
            <div class="modal fade" id="rejectReasonViewModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">拒否理由</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-danger">
                                ${escapedReason}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('rejectReasonViewModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // モーダルをページに追加
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('rejectReasonViewModal'));
        modal.show();
    }

    // 高度なフィルター適用
    applyAdvancedFilter(tabId = 'all') {
        // フォームから値を取得
        const dateFrom = document.getElementById(`dateFrom${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).value;
        const dateTo = document.getElementById(`dateTo${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).value;
        const status = tabId === 'all' ? 
            document.getElementById(`advancedStatusFilter${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).value : 
            '';

        // フィルター設定を更新（日付文字列をDate型に変換）
        this.advancedFilter = {
            dateFrom: dateFrom ? new Date(dateFrom) : null,
            dateTo: dateTo ? new Date(dateTo) : null,
            status: status || ''
        };

        console.log('フィルター設定を適用:', this.advancedFilter);

        // ユーザーをフィルタリングして再描画
        this.filterAllTabs();
        
        // 特定のタブに対して表示を更新
        this.renderFilteredTable(tabId);
    }
    
    // フィルタリングロジック（高度なフィルターを含む）
    filterUsers(users) {
        if (!this.advancedFilter.dateFrom && !this.advancedFilter.dateTo && !this.advancedFilter.status) {
            return users; // フィルターなし
        }
        
        return users.filter(user => {
            // 日付フィルタリング
            if (this.advancedFilter.dateFrom || this.advancedFilter.dateTo) {
                const createdAt = user.createdAt ? new Date(user.createdAt) : null;
                
                if (!createdAt) return false;
                
                // dateFromの比較（開始日以降）
                if (this.advancedFilter.dateFrom) {
                    // 日付の時刻部分をリセットして日付のみで比較
                    const dateFrom = new Date(this.advancedFilter.dateFrom);
                    dateFrom.setHours(0, 0, 0, 0);
                    
                    const createdDate = new Date(createdAt);
                    createdDate.setHours(0, 0, 0, 0);
                    
                    if (createdDate < dateFrom) {
                        return false;
                    }
                }
                
                // dateToの比較（終了日以前）
                if (this.advancedFilter.dateTo) {
                    // 終了日の23:59:59まで含めるための調整
                    const dateTo = new Date(this.advancedFilter.dateTo);
                    dateTo.setHours(23, 59, 59, 999);
                    
                    if (createdAt > dateTo) {
                        return false;
                    }
                }
            }
            
            // ステータスフィルタリング
            if (this.advancedFilter.status) {
                switch (this.advancedFilter.status) {
                    case 'approved':
                        if (user.isApproved !== true) return false;
                        break;
                    case 'pending':
                        if (user.documentStatus !== 'submitted' || user.isApproved === true) return false;
                        break;
                    case 'rejected':
                        if (user.documentStatus !== 'rejected') return false;
                        break;
                    case 'not_submitted':
                        if (user.documentStatus !== 'not_submitted') return false;
                        break;
                }
            }
            
            return true;
        });
    }
    
    // データの可視化
    renderCharts() {
        this.renderStatusChart();
        this.renderRegistrationChart();
    }
    
    // ステータス分布のチャート
    renderStatusChart() {
        const statusChartElement = document.getElementById('statusChart');
        if (!statusChartElement) {
            console.log('statusChart要素が見つかりません。グラフ描画をスキップします。');
            return;
        }
        
        const approved = this.allUsers.filter(user => user.isApproved === true).length;
        const pending = this.allUsers.filter(user => 
            user.documentStatus === 'submitted' && (!user.isApproved || user.isApproved === false)).length;
        const rejected = this.allUsers.filter(user => user.documentStatus === 'rejected').length;
        const notSubmitted = this.allUsers.filter(user => user.documentStatus === 'not_submitted').length;
        
        const ctx = statusChartElement.getContext('2d');
        
        // 既存のチャートを破棄
        if (this.statusChart) {
            this.statusChart.destroy();
        }
        
        this.statusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['認証済', '未認証', '拒否', '書類待ち'],
                datasets: [{
                    data: [approved, pending, rejected, notSubmitted],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',  // 緑
                        'rgba(255, 193, 7, 0.8)',  // 黄
                        'rgba(220, 53, 69, 0.8)',  // 赤
                        'rgba(108, 117, 125, 0.8)' // グレー
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'ユーザーステータス分布'
                    }
                }
            }
        });
        
        // 統計数値の更新
        document.getElementById('totalUsersCount').textContent = this.allUsers.length;
        document.getElementById('approvedUsersCount').textContent = approved;
        document.getElementById('pendingUsersCount').textContent = pending;
        document.getElementById('rejectedUsersCount').textContent = rejected;
    }
    
    // 登録日分布のチャート
    renderRegistrationChart() {
        const registrationChartElement = document.getElementById('registrationChart');
        if (!registrationChartElement) {
            console.log('registrationChart要素が見つかりません。グラフ描画をスキップします。');
            return;
        }
        
        // 過去6ヶ月間のデータを集計
        const now = new Date();
        const months = [];
        const counts = [];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth();
            
            // 月初日と月末日
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            // この月に登録したユーザー数
            const count = this.allUsers.filter(user => {
                if (!user.createdAt) return false;
                const createDate = new Date(user.createdAt);
                return createDate >= firstDay && createDate <= lastDay;
            }).length;
            
            // 日本語の月名
            const monthName = `${year}年${month + 1}月`;
            months.push(monthName);
            counts.push(count);
        }
        
        const ctx = registrationChartElement.getContext('2d');
        
        // 既存のチャートを破棄
        if (this.registrationChart) {
            this.registrationChart.destroy();
        }
        
        this.registrationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: '新規登録ユーザー数',
                    data: counts,
                    backgroundColor: 'rgba(0, 123, 255, 0.8)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '月別登録ユーザー数'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0 // 整数のみ表示
                        }
                    }
                }
            }
        });
    }

    // データエクスポート
    exportData(format) {
        // 現在のタブのユーザーリストを取得
        const activeTabId = document.querySelector('.tab-pane.active').id.replace('-tab-pane', '');
        const users = this.getFilteredUsers(activeTabId);
        
        if (users.length === 0) {
            alert('エクスポートするデータがありません');
            return;
        }
        
        // ヘッダー行
        const headers = ['ID', 'ユーザー名', 'メールアドレス', 'ステータス', '登録日', '書類提出日'];
        
        // データ行
        const rows = users.map(user => [
            user.id,
            user.username,
            user.email,
            this.getUserStatusText(user),
            user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
            user.documentSubmittedAt ? new Date(user.documentSubmittedAt).toLocaleDateString() : ''
        ]);
        
        // CSVまたはExcel形式でエクスポート
        if (format === 'csv') {
            this.exportCSV(headers, rows);
        } else {
            alert('Excel形式のエクスポートはバックエンドAPIが必要です。管理者に連絡してください。');
            // 実際にはバックエンドAPIを使用してExcelを生成
        }
    }
    
    // CSV形式でエクスポート
    exportCSV(headers, rows) {
        // BOMを追加して文字化け対策
        const BOM = '\uFEFF';
        
        // ヘッダー行を追加
        let csvContent = BOM + headers.join(',') + '\n';
        
        // データ行を追加
        rows.forEach(row => {
            // 各フィールドをクオートで囲み、カンマで結合
            const processedRow = row.map(field => {
                // 文字列に変換してダブルクオートをエスケープ
                const str = String(field).replace(/"/g, '""');
                return `"${str}"`;
            }).join(',');
            
            csvContent += processedRow + '\n';
        });
        
        // Blobオブジェクトを作成
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // ダウンロードリンクを作成
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        // リンクを追加してクリック
        document.body.appendChild(link);
        link.click();
        
        // クリーンアップ
        document.body.removeChild(link);
    }
    
    // ユーザーステータスのテキスト表現を取得
    getUserStatusText(user) {
        if (user.isApproved === true) return '認証済';
        if (user.documentStatus === 'submitted') return '未認証';
        if (user.documentStatus === 'rejected') return '拒否';
        return '書類待ち';
    }
    
    // 一括拒否処理
    handleBulkReject() {
        if (this.selectedUsers.size === 0) {
            alert('拒否するユーザーを選択してください');
            return;
        }
        
        // モーダルを表示
        document.getElementById('bulkRejectCount').textContent = this.selectedUsers.size;
        document.getElementById('bulkRejectReason').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('bulkRejectModal'));
        modal.show();
    }
    
    // 一括拒否確定処理
    async confirmBulkReject() {
        const reason = document.getElementById('bulkRejectReason').value.trim();
        if (!reason) {
            alert('拒否理由を入力してください');
            return;
        }
        
        try {
            // モーダルを閉じる
            bootstrap.Modal.getInstance(document.getElementById('bulkRejectModal')).hide();
            
            // バックエンドで一括拒否APIがない場合は、順次処理する
            const promises = Array.from(this.selectedUsers).map(userId => {
                return fetchWithAuth(ADMIN_API.REJECT_USER(userId), {
                    method: 'POST',
                    body: JSON.stringify({ reason })
                });
            });
            
            await Promise.all(promises);
            
            alert(`${this.selectedUsers.size}人のユーザーを拒否しました`);
            this.selectedUsers.clear();
            await this.fetchUsers();
            
            // チェックボックスの選択状態をリセット
            document.querySelectorAll('.user-checkbox, #selectAllCheckbox, #selectAllPendingCheckbox, #selectAllRejectedCheckbox, #selectAllNotSubmittedCheckbox, #selectAllApprovedCheckbox').forEach(checkbox => {
                checkbox.checked = false;
            });
        } catch (error) {
            console.error('一括拒否に失敗:', error);
            alert('一括拒否に失敗しました');
        }
    }
    
    // 一括停止処理
    async handleBulkSuspend() {
        if (this.selectedUsers.size === 0) {
            alert('停止するユーザーを選択してください');
            return;
        }

        if (!confirm(`選択した ${this.selectedUsers.size} 人のユーザーを停止しますか？`)) {
            return;
        }

        try {
            // バックエンドで一括停止APIがない場合は、順次処理する
            alert('この機能はバックエンドAPIが実装されていません。管理者に連絡してください。');
            // 実際の実装ではAPIを呼び出す
        } catch (error) {
            console.error('一括停止に失敗:', error);
            alert('一括停止に失敗しました');
        }
    }

    // URLクエリパラメータに基づいてタブを選択する
    activateTabFromURL() {
        // URLからクエリパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        if (tabParam) {
            // 対応するタブが存在するか確認
            const validTabs = ['all', 'pending', 'approved', 'rejected', 'notSubmitted'];
            if (validTabs.includes(tabParam)) {
                // 対応するBootstrapタブを取得してアクティブにする
                const tabElement = document.getElementById(`${tabParam}-tab`);
                if (tabElement) {
                    // Bootstrapのタブオブジェクトを作成してshowメソッドを呼び出す
                    const tab = new bootstrap.Tab(tabElement);
                    tab.show();
                    
                    console.log(`タブを選択しました: ${tabParam}`);
                }
            }
        }
    }
}

// インスタンスの作成
const pendingUsers = new PendingUsers(); 