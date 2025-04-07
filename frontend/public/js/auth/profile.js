document.addEventListener('DOMContentLoaded', async () => {
    // 要素の取得
    const userNickname = document.getElementById('userNickname');
    const userEmail = document.getElementById('userEmail');
    const userCreatedAt = document.getElementById('userCreatedAt');
    const userPosts = document.getElementById('userPosts');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // 書類アップロード関連の要素
    const documentStatusAlert = document.getElementById('documentStatusAlert');
    const documentUploadForm = document.getElementById('documentUploadForm');
    const uploadForm = document.getElementById('uploadForm');
    const documentFile = document.getElementById('documentFile');
    const documentName = document.getElementById('documentName');
    const uploadButton = document.getElementById('uploadButton');
    const documentPreview = document.getElementById('documentPreview');
    const documentImage = document.getElementById('documentImage');
    const documentUploadDate = document.getElementById('documentUploadDate');
    const deleteDocumentBtn = document.getElementById('deleteDocumentBtn');
    
    // 書類一覧関連の要素
    const documentsList = document.getElementById('documentsList');
    const documentsContainer = document.getElementById('documentsContainer');
    const noDocumentsMessage = document.getElementById('noDocumentsMessage');

    // プロフィール編集関連の要素
    const editNickname = document.getElementById('editNickname');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const iconSelector = document.getElementById('iconSelector');
    const userAvatar = document.querySelector('.user-avatar');
    
    // ツールチップを初期化
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 現在のユーザーデータを格納する変数
    let currentUserData = null;
    let selectedIcon = 'fas fa-user';
    let userDocuments = [];
    
    // ベースURL
    const API_BASE_URL = 'http://localhost:3000/api';
    const SERVER_BASE_URL = 'http://localhost:3000';

    // トークンの取得
    const getToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return null;
        }
        return token;
    };
    
    // APIリクエストヘルパー
    const fetchWithAuth = async (url, options = {}) => {
        const token = getToken();
        if (!token) return null;
        
        // headers がない場合は初期化
        if (!options.headers) {
            options.headers = {};
        }
        
        // Authorization ヘッダーを追加
        options.headers['Authorization'] = `Bearer ${token}`;
        
        // リクエスト実行
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return null;
        }
        
        return response;
    };

    // ユーザー情報を取得
    try {
        const token = getToken();
        if (!token) return;

        // トークンのバリデーション
        if (token.includes('Bearer')) {
            console.error('トークンにBearerプレフィックスが含まれています');
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }

        // デバッグ用：トークン情報の詳細確認
        console.log('=== トークン情報 ===');
        console.log('LocalStorageから取得したトークン:', token);
        console.log('トークンの長さ:', token.length);
        console.log('トークンにBearerが含まれているか:', token.includes('Bearer'));
        console.log('作成するAuthorizationヘッダー:', `Bearer ${token}`);

        const response = await fetch(getApiUrl('users/me'), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // デバッグ用：レスポンスの詳細確認
        console.log('=== ユーザー情報取得 ===');
        console.log('レスポンスステータス:', response.status);
        console.log('レスポンスヘッダー:', Object.fromEntries(response.headers));
        const userData = await response.json();
        console.log('レスポンスデータ:', userData);

        if (!response.ok) {
            throw new Error(userData.error || 'ユーザー情報の取得に失敗しました');
        }

        // ユーザーデータを保存
        currentUserData = userData;

        // デバッグ用：レンダリング前のデータ確認
        console.log('=== レンダリング対象のユーザーデータ ===');
        console.log('ユーザー名:', userData.username);
        console.log('メール:', userData.email);
        console.log('作成日:', userData.createdAt);
        console.log('全データ:', userData);

        // プロフィール情報を表示
        userNickname.textContent = userData.username;
        userEmail.textContent = userData.email;
        userCreatedAt.textContent = new Date(userData.createdAt).toLocaleDateString('ja-JP');

        // プロフィール編集フォームに現在の値をセット
        editNickname.value = userData.username;
        
        // アイコンがある場合は選択状態にする
        if (userData.icon) {
            selectedIcon = userData.icon;
            updateSelectedIcon(userData.icon);
            // ユーザーアイコンを更新
            updateUserAvatar(userData.icon);
        }

        // 投稿履歴は一時的に無効化
        userPosts.innerHTML = '<p class="text-muted">投稿機能は準備中です</p>';
        
        // 書類ステータスを取得
        await loadDocumentStatus();
        
        // 書類一覧を取得
        await loadDocuments();

    } catch (error) {
        console.error('エラー:', error);
        alert(error.message);
    }
    
    // 書類ステータスを取得して表示
    async function loadDocumentStatus() {
        try {
            const response = await fetchWithAuth(getApiUrl('users/document/status'));
            if (!response) return;
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '書類ステータスの取得に失敗しました');
            }
            
            if (data.success) {
                updateDocumentStatusUI(data.data);
            }
        } catch (error) {
            console.error('書類ステータス取得エラー:', error);
            documentStatusAlert.className = 'alert alert-danger';
            documentStatusAlert.textContent = '書類ステータスの取得に失敗しました';
        }
    }
    
    // 書類一覧を取得して表示
    async function loadDocuments() {
        try {
            const response = await fetchWithAuth(getApiUrl('users/document'));
            if (!response) return;
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '書類一覧の取得に失敗しました');
            }
            
            if (data.success) {
                userDocuments = data.data;
                updateDocumentsListUI(userDocuments);
            }
        } catch (error) {
            console.error('書類一覧取得エラー:', error);
            documentsContainer.innerHTML = `
                <div class="alert alert-danger">
                    書類一覧の取得に失敗しました: ${error.message}
                </div>
            `;
        }
    }
    
    // 書類ステータスUIの更新
    function updateDocumentStatusUI(statusData) {
        const { documentStatus, documentVerifiedAt, documentRejectReason, hasDocuments } = statusData;
        
        // ステータスに応じて表示を切り替え
        switch (documentStatus) {
            case 'not_submitted':
                documentStatusAlert.className = 'alert alert-warning';
                documentStatusAlert.textContent = '書類が未提出です。書き込みを行うには本人確認書類の提出が必要です。';
                documentUploadForm.classList.remove('d-none');
                documentPreview.classList.add('d-none');
                break;
                
            case 'submitted':
                documentStatusAlert.className = 'alert alert-info';
                documentStatusAlert.textContent = '書類を提出済みです。管理者の確認をお待ちください。';
                documentUploadForm.classList.remove('d-none');
                documentPreview.classList.add('d-none');
                break;
                
            case 'approved':
                documentStatusAlert.className = 'alert alert-success';
                documentStatusAlert.textContent = `書類が承認されました(${new Date(documentVerifiedAt).toLocaleDateString('ja-JP')})。書き込み機能が利用可能です。`;
                documentUploadForm.classList.remove('d-none');
                documentPreview.classList.add('d-none');
                break;
                
            case 'rejected':
                documentStatusAlert.className = 'alert alert-danger';
                let rejectMessage = '書類が拒否されました。';
                if (documentRejectReason) {
                    rejectMessage += ` 理由: ${documentRejectReason}`;
                }
                documentStatusAlert.textContent = rejectMessage;
                documentUploadForm.classList.remove('d-none');
                documentPreview.classList.add('d-none');
                break;
                
            default:
                documentStatusAlert.className = 'alert alert-secondary';
                documentStatusAlert.textContent = '書類ステータスが不明です。';
                documentUploadForm.classList.remove('d-none');
                documentPreview.classList.add('d-none');
        }
    }
    
    // 書類一覧UIの更新
    function updateDocumentsListUI(documents) {
        if (!documents || documents.length === 0) {
            // 書類がない場合
            noDocumentsMessage.classList.remove('d-none');
            documentsContainer.innerHTML = '';
            return;
        }
        
        // 書類がある場合
        noDocumentsMessage.classList.add('d-none');
        
        // 書類リストを作成
        let html = '';
        documents.forEach(doc => {
            // 書類の承認状態に応じたバッジ
            let statusBadge = '';
            if (doc.isVerified) {
                statusBadge = '<span class="badge bg-success">承認済み</span>';
            } else {
                statusBadge = '<span class="badge bg-warning">審査中</span>';
            }
            
            html += `
                <div class="document-item" data-id="${doc.id}">
                    <div class="document-info">
                        <h6>${doc.documentName || '確認書類'}</h6>
                        <p>
                            ${statusBadge}
                            アップロード: ${new Date(doc.uploadedAt).toLocaleString('ja-JP')}
                        </p>
                    </div>
                    <div class="document-actions">
                        <button class="btn btn-sm btn-outline-primary view-document" data-id="${doc.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!doc.isVerified ? `
                            <button class="btn btn-sm btn-outline-danger delete-document" data-id="${doc.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        documentsContainer.innerHTML = html;
        
        // 削除ボタンのイベントリスナーを追加
        document.querySelectorAll('.delete-document').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.currentTarget.dataset.id;
                deleteDocument(docId);
            });
        });
        
        // 表示ボタンのイベントリスナーを追加
        document.querySelectorAll('.view-document').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.currentTarget.dataset.id;
                viewDocument(docId);
            });
        });
    }
    
    // 書類を表示
    function viewDocument(documentId) {
        const docItem = userDocuments.find(doc => doc.id === documentId);
        if (!docItem) return;
        
        // モーダルを作成して表示
        const modalId = 'documentViewModal';
        let modal = document.getElementById(modalId);
        
        // モーダルがなければ作成
        if (!modal) {
            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">書類表示</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="閉じる"></button>
                            </div>
                            <div class="modal-body">
                                <div class="modal-img-container">
                                    <img id="modalDocumentImage" class="document-view" src="" alt="書類画像">
                                </div>
                                <div class="document-details mt-3">
                                    <p><strong>書類名:</strong> <span id="modalDocumentName"></span></p>
                                    <p><strong>アップロード日時:</strong> <span id="modalDocumentUploadDate"></span></p>
                                    <p><strong>ステータス:</strong> <span id="modalDocumentStatus"></span></p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modal = document.getElementById(modalId);
        }
        
        // モーダル内の要素を更新
        // バックエンドのURLをプレフィックスとして追加
        let imgPath = docItem.documentPath;
        // 完全なURLでない場合は、適切なベースURLを追加
        if (!imgPath.startsWith('http')) {
            // APIパスではなく、サーバーのベースURLを使用
            imgPath = `${SERVER_BASE_URL}${imgPath}`;
        }
        
        console.log('表示する画像のパス:', imgPath);
        document.getElementById('modalDocumentImage').src = imgPath;
        document.getElementById('modalDocumentName').textContent = docItem.documentName;
        
        // アップロード日時
        document.getElementById('modalDocumentUploadDate').textContent = 
            new Date(docItem.uploadedAt).toLocaleString('ja-JP');
        
        // ステータス
        document.getElementById('modalDocumentStatus').textContent = 
            docItem.isVerified ? '承認済み' : '審査中';
        
        // モーダルを表示
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    // 書類アップロードフォームの送信処理
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!documentFile.files[0]) {
            alert('ファイルを選択してください');
            return;
        }
        
        if (!documentName.value.trim()) {
            alert('書類名称を入力してください');
            return;
        }
        
        // フォームデータの作成
        const formData = new FormData();
        formData.append('document', documentFile.files[0]);
        formData.append('documentType', 'other'); // デフォルト値として「その他」を設定
        formData.append('documentName', documentName.value);
        
        // アップロードボタンを無効化
        uploadButton.disabled = true;
        uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>アップロード中...';
        
        try {
            const token = getToken();
            if (!token) return;
            
            const response = await fetch(getApiUrl('users/document/upload'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'アップロードに失敗しました');
            }
            
            // ステータスを更新
            await loadDocumentStatus();
            
            // 書類一覧を更新
            await loadDocuments();
            
            // 成功メッセージ
            alert('書類がアップロードされました');
            
        } catch (error) {
            console.error('書類アップロードエラー:', error);
            alert('書類のアップロードに失敗しました: ' + error.message);
        } finally {
            // アップロードボタンを元に戻す
            uploadButton.disabled = false;
            uploadButton.innerHTML = '<i class="fas fa-upload me-2"></i>アップロード';
            
            // フォームをリセット
            uploadForm.reset();
        }
    });
    
    // 個別の書類削除処理
    async function deleteDocument(documentId) {
        if (!confirm('この書類を削除しますか？')) {
            return;
        }
        
        try {
            const response = await fetchWithAuth(getApiUrl(`users/document/${documentId}`), {
                method: 'DELETE'
            });
            
            if (!response) return;
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || '削除に失敗しました');
            }
            
            // ステータスを更新
            await loadDocumentStatus();
            
            // 書類一覧を更新
            await loadDocuments();
            
            // 成功メッセージ
            alert('書類が削除されました');
            
        } catch (error) {
            console.error('書類削除エラー:', error);
            alert('書類の削除に失敗しました: ' + error.message);
        }
    }
    
    // 全ての書類削除処理（レガシー互換用）
    deleteDocumentBtn.addEventListener('click', async () => {
        if (!confirm('書類を削除して再アップロードしますか？')) {
            return;
        }
        
        try {
            const response = await fetchWithAuth(getApiUrl('users/document'), {
                method: 'DELETE'
            });
            
            if (!response) return;
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || '削除に失敗しました');
            }
            
            // ステータスを更新
            await loadDocumentStatus();
            
            // 書類一覧を更新
            await loadDocuments();
            
            // 成功メッセージ
            alert('全ての書類が削除されました。新しい書類をアップロードしてください。');
            
        } catch (error) {
            console.error('書類削除エラー:', error);
            alert('書類の削除に失敗しました: ' + error.message);
        }
    });

    // アイコン選択のイベント処理
    iconSelector.addEventListener('click', (e) => {
        const option = e.target.closest('.avatar-option');
        if (option) {
            // 現在の選択を解除
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 新しい選択を設定
            option.classList.add('selected');
            selectedIcon = option.dataset.icon;
        }
    });
    
    // 選択されているアイコンを更新する関数
    function updateSelectedIcon(iconClass) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            if (option.dataset.icon === iconClass) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // ユーザーアバターを更新する関数
    function updateUserAvatar(iconClass) {
        // Font Awesomeアイコンを使ってアバターを表示
        userAvatar.innerHTML = `<i class="${iconClass} fa-3x" style="color: #3498db;"></i>`;
        userAvatar.style.display = 'flex';
        userAvatar.style.alignItems = 'center';
        userAvatar.style.justifyContent = 'center';
        userAvatar.style.backgroundColor = '#f8f9fa';
    }

    // プロフィール保存処理
    saveProfileBtn.addEventListener('click', async () => {
        // 入力検証
        if (!editNickname.value.trim()) {
            alert('ニックネームを入力してください');
            return;
        }
        
        // デバッグ：保存しようとしている値
        console.log('=== プロフィール更新 ===');
        console.log('ニックネーム:', editNickname.value);
        console.log('アイコン:', selectedIcon);
        
        // 保存ボタンを無効化
        saveProfileBtn.disabled = true;
        saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>保存中...';
        
        try {
            // リクエストデータを作成
            const requestData = {
                username: editNickname.value,
                icon: selectedIcon
            };
            console.log('リクエストデータ:', requestData);
            
            // リクエスト送信
            const response = await fetchWithAuth(getApiUrl('users/profile'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            console.log('レスポンスステータス:', response.status);
            console.log('レスポンスヘッダー:', Object.fromEntries(response.headers));
            
            if (!response) {
                throw new Error('レスポンスが空です');
            }
            
            const data = await response.json();
            console.log('レスポンスデータ:', data);
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'プロフィールの更新に失敗しました');
            }
            
            // プロフィール情報を更新
            userNickname.textContent = editNickname.value;
            
            // ユーザーアイコンを更新
            updateUserAvatar(selectedIcon);
            
            // モーダルを閉じる
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();
            
            // 成功メッセージ
            alert('プロフィールが更新されました');
            
            // ページをリロードして変更を反映
            window.location.reload();
            
        } catch (error) {
            console.error('プロフィール更新エラー:', error);
            alert('プロフィールの更新に失敗しました: ' + error.message);
        } finally {
            // 保存ボタンを元に戻す
            saveProfileBtn.disabled = false;
            saveProfileBtn.innerHTML = '保存';
        }
    });

    // ログアウトボタンのイベントリスナー
    logoutBtn.addEventListener('click', () => {
        if (confirm('ログアウトしますか？')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
        }
    });
}); 