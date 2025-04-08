// 管理者ダッシュボードのメインJavaScriptファイル

// APIエンドポイントの設定
const API_BASE_URL = 'http://localhost:3000/api';
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

// 静的ファイル用のベースURL
const STATIC_BASE_URL = 'http://localhost:3000';

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
        this.loadUsers();
    }

    initializeEventListeners() {
        // 一括承認ボタン
        document.getElementById('bulkApproveBtn').addEventListener('click', () => this.handleBulkApprove());
        
        // 全選択チェックボックス
        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#pendingUsersTable .user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.handleUserSelection(checkbox);
            });
        });
        
        // 承認待ちタブの全選択チェックボックス
        document.getElementById('selectAllPendingCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#pendingUsersTableSubmitted .user-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = e.target.checked;
                this.handleUserSelection(checkbox);
            });
        });
        
        // 拒否済みタブの全選択チェックボックス
        document.getElementById('selectAllRejectedCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#pendingUsersTableRejected .user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.handleUserSelection(checkbox);
            });
        });
        
        // 未提出タブの全選択チェックボックス
        document.getElementById('selectAllNotSubmittedCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#pendingUsersTableNotSubmitted .user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.handleUserSelection(checkbox);
            });
        });
        
        // 承認済みタブの全選択チェックボックス
        document.getElementById('selectAllApprovedCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#pendingUsersTableApproved .user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.handleUserSelection(checkbox);
            });
        });
        
        // タブの切り替えイベント
        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                // タブ切り替え時に選択状態をリセット
                this.selectedUsers.clear();
                
                // チェックボックスの選択状態をリセット
                document.querySelectorAll('.user-checkbox, #selectAllCheckbox, #selectAllPendingCheckbox, #selectAllRejectedCheckbox, #selectAllNotSubmittedCheckbox, #selectAllApprovedCheckbox').forEach(checkbox => {
                    checkbox.checked = false;
                });
            });
        });
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
                
                this.renderAllUsersTabs();
    } else {
                throw new Error(pendingResponse.error || usersResponse.error || 'データの取得に失敗しました');
    }
  } catch (error) {
            console.error('ユーザーの取得に失敗:', error);
            alert('ユーザーの取得に失敗しました');
        }
    }
    
    // すべてのタブのデータを更新
    renderAllUsersTabs() {
        // 全ユーザーテーブル（承認済みユーザーを含む）
        this.renderUserTable('pendingUsersTable', this.pendingUsers);
        
        // 承認待ちタブ（書類提出済みかつ未承認のユーザー）
        const submittedUsers = this.pendingUsers.filter(user => 
            user.documentStatus === 'submitted' && (!user.isApproved || user.isApproved === false));
        this.renderUserTable('pendingUsersTableSubmitted', submittedUsers);
        
        // 拒否済みタブ
        const rejectedUsers = this.pendingUsers.filter(user => 
            user.documentStatus === 'rejected');
        this.renderUserTable('pendingUsersTableRejected', rejectedUsers);
        
        // 未提出タブ
        const notSubmittedUsers = this.pendingUsers.filter(user => 
            user.documentStatus === 'not_submitted');
        this.renderUserTable('pendingUsersTableNotSubmitted', notSubmittedUsers);

        // 承認済みタブ
        const approvedUsers = this.pendingUsers.filter(user => 
            user.isApproved === true);
        this.renderUserTable('pendingUsersTableApproved', approvedUsers);
        
        // 各タブのカウントを更新
        this.updateTabCounts(
            submittedUsers.length, 
            rejectedUsers.length, 
            notSubmittedUsers.length,
            approvedUsers.length
        );
    }
    
    // タブのカウント表示を更新
    updateTabCounts(submittedCount, rejectedCount, notSubmittedCount, approvedCount) {
        const totalCount = this.pendingUsers.length;
        
        document.getElementById('all-tab').textContent = `全ユーザー (${totalCount})`;
        document.getElementById('pending-tab').textContent = `承認待ち (${submittedCount})`;
        document.getElementById('rejected-tab').textContent = `拒否済み (${rejectedCount})`;
        document.getElementById('not-submitted-tab').textContent = `未提出 (${notSubmittedCount})`;
        document.getElementById('approved-tab').textContent = `承認済み (${approvedCount})`;
    }
    
    // 特定のテーブルにユーザーリストを表示
    renderUserTable(tableId, users) {
        const tableBody = document.getElementById(tableId);
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-3">
                        <div class="alert alert-info mb-0">
                            表示するユーザーがいません
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = users.map(user => {
            // デバッグ用ログ
            console.log(`ユーザーID: ${user.id}, isApproved: ${user.isApproved}, documentStatus: ${user.documentStatus}`);
            
            return `
                <tr>
                    <td class="text-center align-middle">
                        <div class="form-check d-flex justify-content-center">
                            <input type="checkbox" class="user-checkbox form-check-input" 
                                   data-user-id="${user.id}" 
                                   onchange="pendingUsers.handleUserSelection(this)">
                        </div>
                    </td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        ${this.renderUserStatus(user)}
                        ${user.documentSubmittedAt ? `<div class="small text-muted mt-1">提出: ${formatDate(user.documentSubmittedAt)}</div>` : ''}
                    </td>
                    <td>
                        <div class="small text-muted">登録: ${formatDate(user.createdAt)}</div>
                    </td>
                    <td>
                        <div class="btn-group">
                            ${!user.isApproved ? `
                            <button class="btn btn-sm btn-success" onclick="pendingUsers.approveUser('${user.id}')">
                                <i class="bi bi-check-circle"></i> 承認
                            </button>
                            ` : ''}
                            ${user.documentStatus === 'submitted' || user.documentStatus === 'rejected' ? `
                            <button class="btn btn-sm btn-info" onclick="pendingUsers.viewDocument('${user.id}')">
                                <i class="bi bi-file-earmark"></i> 書類
                            </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="pendingUsers.rejectUser('${user.id}')">
                                <i class="bi bi-x-circle"></i> 拒否
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // ツールチップを初期化
        const tooltips = document.querySelectorAll(`#${tableId} [data-bs-toggle="tooltip"]`);
        tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
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
                this.loadUsers();
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
                this.loadUsers();
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
                await this.loadUsers();
                
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
                await this.loadUsers();
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
                    await this.loadUsers();
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
}

// インスタンスの作成
const pendingUsers = new PendingUsers(); 