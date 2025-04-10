const createTestUsers = require('./testUsers');
const createSuperUser = require('./superuser');
const createDummyUsers = require('./dummyUsers');
const seedLocalFinanceThreads = require('../database/seed-local-finance-threads');

const seedAll = async () => {
    try {
        console.log('==== シード処理を開始します ====');
        
        // スーパーユーザーの作成
        await createSuperUser();
        console.log('スーパーユーザーの作成が完了しました');
        
        // テストユーザーの作成
        await createTestUsers();
        console.log('テストユーザーの作成が完了しました');
        
        // ダミーユーザーの作成（本番環境では無効）
        if (process.env.NODE_ENV !== 'production') {
            await createDummyUsers();
            console.log('ダミーユーザーの作成が完了しました');
            
            // 街金カテゴリーの初期スレッド作成
            await seedLocalFinanceThreads();
            console.log('街金カテゴリーの初期スレッド作成が完了しました');
        }
        
        console.log('==== すべてのシード処理が完了しました ====');
    } catch (error) {
        console.error('シード処理中にエラーが発生しました:', error);
        process.exit(1);
    }
};

// スクリプトとして実行された場合
if (require.main === module) {
    seedAll();
}

module.exports = seedAll; 