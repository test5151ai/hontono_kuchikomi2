// ユーザー一覧の状態管理
let currentPage = 1;
let totalPages = 1;
let selectedUsers = new Set();
let currentFilters = {
  keyword: '',
  status: '',
  documentStatus: ''
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // 初期データの読み込み
  loadUsers();

  // 検索フォームのイベントハンドラ設定
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentPage = 1;
    updateFilters();
    loadUsers();
  });

  // 一括選択のイベントハンドラ
  document.getElementById('selectAll').addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('#userTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = e.target.checked;
      const userId = checkbox.value;
      if (e.target.checked) {
        selectedUsers.add(userId);
      } else {
        selectedUsers.delete(userId);
      }
    });
    updateBulkActionButtons();
  });

  // 一括承認ボタンのイベントハンドラ
  document.getElementById('bulkApproveBtn').addEventListener('click', () => {
    if (selectedUsers.size === 0) return;
    if (confirm(`選択した${selectedUsers.size}人のユーザーを承認しますか？`)) {
      bulkApproveUsers(Array.from(selectedUsers));
    }
  });

  // 一括停止ボタンのイベントハンドラ
  document.getElementById('bulkSuspendBtn').addEventListener('click', () => {
    if (selectedUsers.size === 0) return;
    if (confirm(`選択した${selectedUsers.size}人のユーザーを停止しますか？`)) {
      bulkSuspendUsers(Array.from(selectedUsers));
    }
  });

  // エクスポートボタンのイベントハンドラ
  document.getElementById('exportBtn').addEventListener('click', exportUsers);
});

// フィルター条件の更新
function updateFilters() {
  currentFilters = {
    keyword: document.getElementById('searchKeyword').value,
    status: document.getElementById('statusFilter').value,
    documentStatus: document.getElementById('documentFilter').value
  };
}

// ユーザー一覧の読み込み
async function loadUsers() {
  try {
    console.log('=== ユーザー一覧取得リクエスト ===');
    const token = localStorage.getItem('token');
    console.log('トークン:', token ? '存在します' : '存在しません');
    
    const url = `/api/admin/users?page=${currentPage}&${new URLSearchParams(currentFilters)}`;
    console.log('URL:', url);
    console.log('フィルター:', currentFilters);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('レスポンス:', response);

    const result = await response.json();
    console.log('取得データ:', result);

    if (result.success) {
      console.log('データ構造:', {
        users: result.data.users,
        total: result.data.total,
        totalPages: result.data.totalPages,
        currentPage: result.data.currentPage
      });
      renderUsers(result.data.users);
      renderPagination({ 
        totalPages: result.data.totalPages, 
        currentPage: result.data.currentPage 
      });
    } else {
      console.error('APIエラー:', result.message);
      showError(result.message);
    }
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    showError('ユーザー一覧の取得に失敗しました');
  }
}

// ユーザー一覧の描画
function renderUsers(users) {
  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="checkbox" value="${user.id}" ${selectedUsers.has(user.id) ? 'checked' : ''}>
      </td>
      <td>${escapeHtml(user.username)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${renderStatusBadge(user.status)}</td>
      <td>${renderDocumentBadge(user.documentStatus)}</td>
      <td>${formatDate(user.createdAt)}</td>
      <td>${formatDate(user.lastLoginAt)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" disabled title="未実装">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-secondary" disabled title="未実装">
          <i class="bi bi-check-circle"></i>
        </button>
        <button class="btn btn-sm btn-secondary" disabled title="未実装">
          <i class="bi bi-x-circle"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // チェックボックスのイベントハンドラを設定
  tbody.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const userId = e.target.value;
      if (e.target.checked) {
        selectedUsers.add(userId);
      } else {
        selectedUsers.delete(userId);
      }
      updateBulkActionButtons();
    });
  });
}

// ステータスバッジの生成
function renderStatusBadge(status) {
  return '<span class="badge bg-secondary">未実装</span>';
}

// 書類状態バッジの生成
function renderDocumentBadge(status) {
  return '<span class="badge bg-secondary">未実装</span>';
}

// ページネーションの描画
function renderPagination(pagination) {
  const ul = document.getElementById('pagination');
  ul.innerHTML = '';

  // 前のページへのリンク
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `
    <a class="page-link" href="#" onclick="changePage(${pagination.currentPage - 1})">
      <i class="bi bi-chevron-left"></i>
    </a>
  `;
  ul.appendChild(prevLi);

  // ページ番号
  for (let i = 1; i <= pagination.totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === pagination.currentPage ? 'active' : ''}`;
    li.innerHTML = `
      <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
    `;
    ul.appendChild(li);
  }

  // 次のページへのリンク
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `
    <a class="page-link" href="#" onclick="changePage(${pagination.currentPage + 1})">
      <i class="bi bi-chevron-right"></i>
    </a>
  `;
  ul.appendChild(nextLi);
}

// ページ変更
function changePage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  loadUsers();
}

// ユーザー詳細の表示
async function showUserDetail(userId) {
  try {
    const response = await fetch(`/api/admin/users/${userId}`);
    if (!response.ok) throw new Error('ユーザー情報の取得に失敗しました');
    
    const user = await response.json();
    renderUserDetail(user);
    
    const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
    modal.show();
    
  } catch (error) {
    console.error('Error:', error);
    alert('ユーザー情報の取得に失敗しました');
  }
}

// ユーザー詳細モーダルの描画
function renderUserDetail(user) {
  const content = document.getElementById('userDetailContent');
  
  // 基本情報タブ
  const basicInfo = `
    <div class="tab-pane fade show active" id="basicInfo">
      <div class="row">
        <div class="col-md-6">
          <p><strong>ユーザー名:</strong> ${escapeHtml(user.username)}</p>
          <p><strong>メールアドレス:</strong> ${escapeHtml(user.email)}</p>
          <p><strong>ステータス:</strong> ${renderStatusBadge(user.status)}</p>
          <p><strong>登録日時:</strong> ${formatDate(user.createdAt)}</p>
        </div>
        <div class="col-md-6">
          <p><strong>最終ログイン:</strong> ${formatDate(user.lastLoginAt)}</p>
          <p><strong>投稿数:</strong> ${user.postCount}</p>
          <p><strong>スレッド数:</strong> ${user.threadCount}</p>
          <p><strong>ロール:</strong> ${user.role}</p>
        </div>
      </div>
    </div>
  `;

  // 書類情報タブ
  const documentInfo = `
    <div class="tab-pane fade" id="documentInfo">
      <div class="row">
        <div class="col-12">
          <p><strong>書類状態:</strong> ${renderDocumentBadge(user.documentStatus)}</p>
          <p><strong>提出日時:</strong> ${formatDate(user.documentSubmittedAt)}</p>
          <p><strong>確認者:</strong> ${user.documentVerifiedBy || '-'}</p>
          <p><strong>確認日時:</strong> ${formatDate(user.documentVerifiedAt)}</p>
          ${user.documentUrl ? `
            <div class="mt-3">
              <a href="${user.documentUrl}" class="btn btn-primary" target="_blank">
                <i class="bi bi-download me-1"></i>書類をダウンロード
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // アクティビティタブ
  const activityInfo = `
    <div class="tab-pane fade" id="activityInfo">
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>日時</th>
              <th>アクション</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            ${user.activities?.map(activity => `
              <tr>
                <td>${formatDate(activity.createdAt)}</td>
                <td>${escapeHtml(activity.action)}</td>
                <td>${escapeHtml(activity.detail)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3">アクティビティはありません</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  content.innerHTML = basicInfo + documentInfo + activityInfo;
}

// ユーザーの承認
async function approveUser(userId) {
  try {
    const response = await fetch(`/api/admin/users/${userId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('ユーザーの承認に失敗しました');
    
    loadUsers();
    alert('ユーザーを承認しました');
    
  } catch (error) {
    console.error('Error:', error);
    alert('ユーザーの承認に失敗しました');
  }
}

// ユーザーの一括承認
async function bulkApproveUsers(userIds) {
  try {
    const response = await fetch('/api/admin/users/bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds })
    });
    
    if (!response.ok) throw new Error('ユーザーの一括承認に失敗しました');
    
    selectedUsers.clear();
    loadUsers();
    alert('選択したユーザーを承認しました');
    
  } catch (error) {
    console.error('Error:', error);
    alert('ユーザーの一括承認に失敗しました');
  }
}

// ユーザーの停止
async function suspendUser(userId) {
  try {
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('ユーザーの停止に失敗しました');
    
    loadUsers();
    alert('ユーザーを停止しました');
    
  } catch (error) {
    console.error('Error:', error);
    alert('ユーザーの停止に失敗しました');
  }
}

// ユーザーの一括停止
async function bulkSuspendUsers(userIds) {
  try {
    const response = await fetch('/api/admin/users/bulk-suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds })
    });
    
    if (!response.ok) throw new Error('ユーザーの一括停止に失敗しました');
    
    selectedUsers.clear();
    loadUsers();
    alert('選択したユーザーを停止しました');
    
  } catch (error) {
    console.error('Error:', error);
    alert('ユーザーの一括停止に失敗しました');
  }
}

// ユーザー情報のエクスポート
async function exportUsers() {
  try {
    const response = await fetch('/api/admin/users/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentFilters)
    });
    
    if (!response.ok) throw new Error('エクスポートに失敗しました');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
  } catch (error) {
    console.error('Error:', error);
    alert('エクスポートに失敗しました');
  }
}

// 一括操作ボタンの更新
function updateBulkActionButtons() {
  const hasSelection = selectedUsers.size > 0;
  document.getElementById('bulkApproveBtn').disabled = !hasSelection;
  document.getElementById('bulkSuspendBtn').disabled = !hasSelection;
}

// ユーティリティ関数

// 日付のフォーマット
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// HTMLエスケープ
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// エラーメッセージの表示
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('#userList') || document.querySelector('main');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // 5秒後に自動で消える
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    } else {
        console.error('エラーメッセージを表示するための要素が見つかりません');
    }
} 