// 統計情報ページのJavaScriptファイル

// APIエンドポイントの設定
const API_BASE_URL = window.API_CONFIG ? window.API_CONFIG.BASE_URL : '/api';
const ADMIN_API = {
    PENDING_USERS: `${API_BASE_URL}/admin/users/pending`,
    USERS: `${API_BASE_URL}/admin/users`,
    THREADS: `${API_BASE_URL}/admin/threads`,
    CATEGORIES: `${API_BASE_URL}/admin/categories`,
    MONTHLY_STATS: `${API_BASE_URL}/admin/analytics/monthly`,
    POPULAR_THREADS: `${API_BASE_URL}/admin/analytics/popular-threads`
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
        this.loadCategoryStats();
        this.loadAccessStats();
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

    async loadCategoryStats() {
        try {
            // カテゴリー一覧を取得
            const response = await fetchWithAuth(ADMIN_API.CATEGORIES);
            
            if (response.success) {
                const categories = response.data;
                
                // カテゴリー名とスレッド数の配列を作成
                const categoryNames = categories.map(category => category.name);
                const threadCounts = categories.map(category => category.threadCount);
                
                // カテゴリー統計チャートを更新
                this.updateCategoryStatsChart(categoryNames, threadCounts);
            }
        } catch (error) {
            console.error('カテゴリー統計の取得に失敗:', error);
        }
    }

    async loadAccessStats() {
        try {
            // APIからアクセス統計データを取得
            const response = await fetchWithAuth(ADMIN_API.MONTHLY_STATS);
            
            if (response.success) {
                const { labels, accessCounts } = response.data;
                this.updateAccessStatsChart(labels, accessCounts);
            } else {
                // APIが失敗した場合はダミーデータを使用
                const accessData = this.generateMonthlyAccessData();
                this.updateAccessStatsChart(accessData.labels, accessData.data);
            }
        } catch (error) {
            console.error('アクセス統計の取得に失敗:', error);
            // エラー時はダミーデータを使用
            const accessData = this.generateMonthlyAccessData();
            this.updateAccessStatsChart(accessData.labels, accessData.data);
        }
    }

    generateMonthlyAccessData() {
        // 現在の日付から過去12ヶ月のラベルを生成
        const labels = [];
        const data = [];
        const currentDate = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = month.toLocaleDateString('ja-JP', { month: 'short', year: 'numeric' });
            labels.push(monthName);
            
            // リアルなアクセス数のシミュレーション
            // 基本値 + トレンド成長 + 季節変動 + ランダム変動
            const baseValue = 1000; // 基本アクセス数
            const growthTrend = i * 200; // 月ごとの成長トレンド
            const seasonality = Math.sin((month.getMonth() / 12) * Math.PI * 2) * 500; // 季節変動
            const randomVariation = Math.floor(Math.random() * 300); // ランダム変動
            
            const monthlyAccess = Math.max(100, Math.floor(baseValue + growthTrend + seasonality + randomVariation));
            data.push(monthlyAccess);
        }
        
        return { labels, data };
    }

    updateAccessStatsChart(labels, data) {
        this.accessStatsChart.data.labels = labels;
        this.accessStatsChart.data.datasets[0].data = data;
        this.accessStatsChart.update();
    }

    initializeCharts() {
        // グラフ表示設定の共通設定
        Chart.defaults.font.size = 12; // フォントサイズを小さくする
        Chart.defaults.elements.point.radius = 3; // ポイントサイズを小さくする

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
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top', // 凡例を上部に移動
                        labels: {
                            boxWidth: 15, // 凡例の色ボックスを小さくする
                            padding: 10 // パディングを減らす
                        }
                    },
                    title: {
                        display: true,
                        text: 'ユーザーステータス分布',
                        font: {
                            size: 14 // タイトルフォントサイズ
                        }
                    }
                }
            }
        });

        // カテゴリー統計チャート（初期化）
        const categoryStatsCtx = document.getElementById('categoryStatsChart').getContext('2d');
        this.categoryStatsChart = new Chart(categoryStatsCtx, {
            type: 'bar',
            data: {
                labels: [], // 空の配列で初期化
                datasets: [{
                    label: 'スレッド数',
                    data: [], // 空の配列で初期化
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 15,
                            padding: 10
                        }
                    },
                    title: {
                        display: true,
                        text: 'カテゴリー別スレッド数',
                        font: {
                            size: 14
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
                labels: [], // 空の配列で初期化
                datasets: [{
                    label: '月間アクセス数',
                    data: [], // 空の配列で初期化
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return value / 1000 + 'k';
                                }
                                return value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 15,
                            padding: 10
                        }
                    },
                    title: {
                        display: true,
                        text: '月間アクセス統計',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        });
    }

    updateUserStatsChart(approved, pending, rejected, notSubmitted) {
        this.userStatsChart.data.datasets[0].data = [approved, pending, rejected, notSubmitted];
        this.userStatsChart.update();
    }

    updateCategoryStatsChart(labels, data) {
        this.categoryStatsChart.data.labels = labels;
        this.categoryStatsChart.data.datasets[0].data = data;
        this.categoryStatsChart.update();
    }

    async loadPopularThreads() {
        try {
            // APIから人気スレッドデータを取得
            const response = await fetchWithAuth(ADMIN_API.POPULAR_THREADS);
            
            if (response.success) {
                this.renderPopularThreads(response.data);
            } else {
                // APIが失敗した場合はダミーデータを使用
                this.renderPopularThreadsDummy();
            }
        } catch (error) {
            console.error('人気スレッドの取得に失敗:', error);
            // エラー時はダミーデータを使用
            this.renderPopularThreadsDummy();
        }
    }

    renderPopularThreads(threads) {
        const tableBody = document.getElementById('popularThreads');
        tableBody.innerHTML = '';

        if (!threads || threads.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="text-center">データがありません</td>';
            tableBody.appendChild(row);
            return;
        }

        threads.forEach((thread, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${thread.title}</td>
                <td>${thread.viewCount}</td>
                <td>${thread.user ? thread.user.username : '不明'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderPopularThreadsDummy() {
        // ダミーデータを使用（既存の実装を再利用）
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