/**
 * スレッド設定ファイル
 */
module.exports = {
    // 1スレッドあたりの最大投稿数
    maxPostsPerThread: parseInt(process.env.MAX_POSTS_PER_THREAD || 1000, 10),
    
    // スレッドタイトルのデフォルトサフィックス
    defaultTitleSuffix: 'の情報スレ'
}; 