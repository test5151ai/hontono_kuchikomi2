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
    if (!dateString) return 'N/A';
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
        this.pendingUsers = []; // 互換性のため
        this.searchKeywords = {
            all: '',
            pending: '',
            approved: '',
            rejected: '',
            notSubmitted: '',
            admin: ''
        };
        this.selectedUsers = new Set();
        this.currentPages = {
            all: 1,
            pending: 1,
            approved: 1,
            rejected: 1,
            notSubmitted: 1,
            admin: 1
        };
        this.limits = {
            all: 10,
            pending: 10,
            approved: 10,
            rejected: 10,
            notSubmitted: 10,
            admin: 10
        };
        this.sortFields = {
            all: 'createdAt',
            pending: 'createdAt',
            approved: 'createdAt',
            rejected: 'createdAt',
            notSubmitted: 'createdAt',
            admin: 'createdAt'
        };
        this.sortDirections = {
            all: 'desc',
            pending: 'desc',
            approved: 'desc',
            rejected: 'desc',
            notSubmitted: 'desc',
            admin: 'desc'
        };
    }

    // 既存ユーザーの初期化
    async init() {
        try {
            console.log('ユーザー管理画面を初期化中...');
            await this.loadUsers();
            console.log('ユーザーデータ読み込み完了');
        } catch (error) {
            console.error('初期化エラー:', error);
        }
    }

    // すべてのタブにユーザーリストを表示
    renderAllUsersTabs() {
        try {
            console.log('renderAllUsersTabs呼び出し');
            
            // 各タブのユーザー数をカウント
            const adminUsers = this.allUsers.filter(user => user.role === 'admin' || user.role === 'superuser');
            const regularUsers = this.allUsers.filter(user => user.role === 'user');
            const pendingUsers = this.allUsers.filter(user => !user.isApproved && user.documentStatus === 'submitted');
            const approvedUsers = this.allUsers.filter(user => user.isApproved && user.role === 'user');
            const rejectedUsers = this.allUsers.filter(user => user.documentStatus === 'rejected');
            const notSubmittedUsers = this.allUsers.filter(user => !user.documentSubmittedAt || user.documentStatus === 'not_submitted');
            
            // バッジにユーザー数を表示
            try {
                if (document.getElementById('badge-all')) {
                    document.getElementById('badge-all').textContent = regularUsers.length;
                }
                if (document.getElementById('badge-admin')) {
                    document.getElementById('badge-admin').textContent = adminUsers.length;
                }
                if (document.getElementById('badge-pending')) {
                    document.getElementById('badge-pending').textContent = pendingUsers.length;
                }
                if (document.getElementById('badge-approved')) {
                    document.getElementById('badge-approved').textContent = approvedUsers.length;
                }
                if (document.getElementById('badge-rejected')) {
                    document.getElementById('badge-rejected').textContent = rejectedUsers.length;
                }
                if (document.getElementById('badge-notSubmitted')) {
                    document.getElementById('badge-notSubmitted').textContent = notSubmittedUsers.length;
                }
                
                console.log('バッジ更新完了');
            } catch (e) {
                console.warn('バッジ更新エラー:', e);
            }
        } catch (error) {
            console.error('タブ表示エラー:', error);
        }
    }

    // ユーザーデータを読み込む
    async loadUsers() {
        try {
            console.log('ユーザーデータ読み込み開始...');
            // まず承認待ちユーザーを取得（旧APIを使用）
            const pendingResponse = await fetchWithAuth(ADMIN_API.PENDING_USERS);
            
            // 次に全ユーザーを取得
            const usersResponse = await fetchWithAuth(ADMIN_API.USERS);
            
            if (pendingResponse.success && usersResponse.success) {
                try {
                    // 承認待ちユーザーは直接データを取得
                    const pendingUsers = pendingResponse.data || [];
                    
                    // 全ユーザーはdata.usersから取得
                    const allUsers = usersResponse.data.users || [];
                    
                    console.log('取得したユーザーデータ:', {
                        pending: pendingUsers.length,
                        all: allUsers.length
                    });
                    
                    // バックエンドから取得したユーザーデータをallUsersプロパティにセット
                    this.allUsers = [...allUsers];
                    
                    // 古い互換性のためのpendingUsersプロパティも更新
                    this.pendingUsers = [...allUsers];
                    
                    // ユーザー数を表示
                    const adminUsers = this.allUsers.filter(user => user.role === 'admin' || user.role === 'superuser');
                    const regularUsers = this.allUsers.filter(user => user.role === 'user');
                    
                    console.log('ユーザー統計:', {
                        total: this.allUsers.length,
                        admin: adminUsers.length,
                        regular: regularUsers.length
                    });
                    
                    // レンダリング
                    this.renderAllUsersTabs();
                    
                    return true;
                } catch (processingError) {
                    console.error('ユーザーデータ処理エラー:', processingError);
                    return false;
                }
            } else {
                const errorMessage = pendingResponse.error || usersResponse.error || 'データの取得に失敗しました';
                console.error('API応答エラー:', errorMessage);
                alert(`ユーザーデータの取得に失敗しました: ${errorMessage}`);
                return false;
            }
        } catch (error) {
            console.error('ユーザーの取得に失敗:', error);
            alert('ユーザーの取得に失敗しました: ' + error.message);
            return false;
        }
    }

    // ユーザーステータスの表示
    renderUserStatus(user) {
        // ユーザーが承認済みの場合
        if (user.isApproved === true) {
            return '<span class="badge bg-success">認証済</span>';
        }
        
        // ユーザーが拒否されている場合
        if (user.documentStatus === 'rejected') {
            return '<span class="badge bg-danger">拒否</span>';
        }
        
        // 書類が提出済みで承認待ちの場合
        if (user.documentStatus === 'submitted') {
            return '<span class="badge bg-warning">未認証</span>';
        }
        
        // 書類が未提出の場合
        return '<span class="badge bg-secondary">書類待ち</span>';
    }
    
    // ユーザーロールに応じたバッジスタイルを返す関数
    getUserRoleBadge(role) {
        switch(role) {
            case 'admin':
                return '<span class="badge bg-purple ms-2" title="管理者">管理者</span>';
            case 'superuser':
                return '<span class="badge bg-danger ms-2" title="スーパー管理者">スーパー管理者</span>';
            case 'user':
            default:
                return '<span class="badge bg-secondary ms-2" title="一般ユーザー">一般</span>';
        }
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('ユーザー管理画面を読み込み中...');
    window.pendingUsers = new PendingUsers();
    await window.pendingUsers.init();
}); 