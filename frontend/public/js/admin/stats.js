// 統計情報ページのJavaScriptファイル

// APIエンドポイントの設定
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_API = {
    PENDING_USERS: `${API_BASE_URL}/admin/users/pending`,
    USERS: `${API_BASE_URL}/admin/users`,
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

// 統計ページクラス
class StatsPage {
    constructor() {
        this.initializeCharts();
        this.loadUserStats();
        this.loadPopularThreads();
        this.loadActiveUsers();
    }

    async loadUserStats() {
        try {
            // ユーザー情報APIを使用して統計を取得
            const pendingResponse = await fetchWithAuth(ADMIN_API.PENDING_USERS);
            const usersResponse = await fetchWithAuth(ADMIN_API.USERS);
            
            if (pendingResponse.success && usersResponse.success) {
                const pendingUsers = pendingResponse.data;
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
                const approved = combinedUsers.filter(user => user.isApproved === true).length;
                const pending = combinedUsers.filter(user => 
                    user.documentStatus === 'submitted' && (!user.isApproved || user.isApproved === false)).length;
                const rejected = combinedUsers.filter(user => user.documentStatus === 'rejected').length;
                const notSubmitted = combinedUsers.filter(user => user.documentStatus === 'not_submitted').length;
                
                // 統計データを表示
                document.getElementById('totalUsersCount').textContent = totalUsers;
                document.getElementById('approvedUsersCount').textContent = approved;
                document.getElementById('pendingUsersCount').textContent = pending;
                document.getElementById('rejectedUsersCount').textContent = rejected;
                
                // ユーザー統計チャートを更新
                this.updateUserStatsChart(approved, pending, rejected, notSubmitted);
            }
        } catch (error) {
            console.error('ユーザー統計の取得に失敗:', error);
        }
    }

    initializeCharts() {
        // ユーザー統計チャート（初期化）
        const userStatsCtx = document.getElementById('userStatsChart').getContext('2d');
        this.userStatsChart = new Chart(userStatsCtx, {
            type: 'pie',
            data: {
                labels: ['認証済', '未認証', '拒否', '書類待ち'],
                datasets: [{
                    data: [0, 0, 0, 0],
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

        // カテゴリー統計チャート（初期化）
        const categoryStatsCtx = document.getElementById('categoryStatsChart').getContext('2d');
        this.categoryStatsChart = new Chart(categoryStatsCtx, {
            type: 'bar',
            data: {
                labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
                datasets: [{
                    label: 'スレッド数',
                    data: [12, 19, 8, 15, 10],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });

        // アクセス統計チャート（初期化）
        const accessStatsCtx = document.getElementById('accessStatsChart').getContext('2d');
        this.accessStatsChart = new Chart(accessStatsCtx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '月間アクセス数',
                    data: [1200, 1900, 2300, 2800, 3500, 4200],
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateUserStatsChart(approved, pending, rejected, notSubmitted) {
        this.userStatsChart.data.datasets[0].data = [approved, pending, rejected, notSubmitted];
        this.userStatsChart.update();
    }

    loadPopularThreads() {
        // 人気スレッドランキングのダミーデータ
        const popularThreads = [
            { title: '初めての転職について', posts: 156, views: 3420 },
            { title: '今年のボーナス事情', posts: 132, views: 2980 },
            { title: 'テレワークの実態調査', posts: 98, views: 2450 },
            { title: '休日出勤の手当について', posts: 87, views: 1870 },
            { title: '勤怠管理システムの問題点', posts: 76, views: 1690 }
        ];

        const tableBody = document.getElementById('popularThreads');
        tableBody.innerHTML = '';

        popularThreads.forEach((thread, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${thread.title}</td>
                <td>${thread.posts}</td>
                <td>${thread.views}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    loadActiveUsers() {
        // アクティブユーザーランキングのダミーデータ
        const activeUsers = [
            { username: 'user123', posts: 78, threads: 12 },
            { username: 'kuchikomi_fan', posts: 65, threads: 8 },
            { username: 'office_worker', posts: 54, threads: 5 },
            { username: 'job_hunter', posts: 43, threads: 7 },
            { username: 'career_advisor', posts: 39, threads: 10 }
        ];

        const tableBody = document.getElementById('activeUsers');
        tableBody.innerHTML = '';

        activeUsers.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.posts}</td>
                <td>${user.threads}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    new StatsPage();
}); 