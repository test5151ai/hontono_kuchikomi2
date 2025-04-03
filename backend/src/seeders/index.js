const createSuperUser = require('./superuser');
const createTestUsers = require('./testUsers');

const runSeeds = async () => {
    try {
        // スーパーユーザーの作成
        await createSuperUser();

        // 開発環境の場合のみテストユーザーを作成
        if (process.env.NODE_ENV === 'development') {
            await createTestUsers();
        }

        console.log('シードの実行が完了しました');
        process.exit(0);
    } catch (error) {
        console.error('シードの実行に失敗しました:', error);
        process.exit(1);
    }
};

runSeeds(); 