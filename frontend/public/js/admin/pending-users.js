// 管理者ダッシュボードのメインJavaScriptファイル

// APIエンドポイントの設定
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_API = {
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
                <td>${this.renderDocumentBadge(user.documentStatus)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="pendingUsers.approveUser('${user.id}')">
                            <i class="bi bi-check-circle"></i> 承認
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="pendingUsers.rejectUser('${user.id}')">
                            <i class="bi bi-x-circle"></i> 拒否
                        </button>
                        ${user.documentStatus === 'submitted' ? `
                        <button class="btn btn-sm btn-info" onclick="pendingUsers.viewDocument('${user.id}')">
                            <i class="bi bi-file-earmark"></i> 書類
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 書類状態バッジの生成
    renderDocumentBadge(status) {
        switch(status) {
            case 'submitted':
                return '<span class="badge bg-info">提出済</span>';
            case 'approved':
                return '<span class="badge bg-success">承認済</span>';
            case 'rejected':
                return '<span class="badge bg-danger">拒否</span>';
            case 'not_submitted':
            default:
                return '<span class="badge bg-secondary">未提出</span>';
        }
    }

    // 書類を表示
    async viewDocument(userId) {
        try {
            const response = await fetchWithAuth(ADMIN_API.GET_DOCUMENT(userId));
            
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
                                <img src="${documentData.documentPath}" class="img-fluid" alt="書類" 
                                     style="max-height: 500px; width: auto; margin: 0 auto; display: block;">
                            </div>
                            <div class="document-info">
                                <p><strong>提出日時:</strong> ${formatDate(documentData.documentSubmittedAt)}</p>
                                <p><strong>ステータス:</strong> ${this.renderDocumentBadge(documentData.documentStatus)}</p>
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
                this.loadPendingUsers();
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
            const reason = document.getElementById('rejectReason').value;
            if (!reason) {
                alert('拒否理由を入力してください');
                return;
            }
            
            const response = await fetchWithAuth(ADMIN_API.REJECT_DOCUMENT(userId), {
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            
            if (response.success) {
                alert('書類を拒否しました');
                // モーダルを閉じる
                bootstrap.Modal.getInstance(document.getElementById('documentModal')).hide();
                // 一覧を更新
                this.loadPendingUsers();
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