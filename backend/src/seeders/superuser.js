const bcrypt = require('bcrypt');
const { User, sequelize } = require('../models');

const createSuperUser = async () => {
    // テスト環境の場合、ログ出力を抑制
    const isTestEnv = process.env.NODE_ENV === 'test';
    const logInfo = isTestEnv ? () => {} : console.log;
    const logError = isTestEnv ? () => {} : console.error;
    
    try {
        // テーブルの存在を確認
        try {
            // ユーザーテーブルの存在を確認するためのクエリを実行
            await sequelize.query('SELECT 1 FROM users LIMIT 1');
            logInfo('usersテーブルが正常に確認できました');
        } catch (tableErr) {
            // テーブルが存在しない場合はエラーをスローしてキャッチ
            logError('usersテーブルが見つかりません。マイグレーションが必要です:', tableErr.message);
            logInfo('スーパーユーザー作成をスキップします');
            return; // 早期リターンでスーパーユーザー作成をスキップ
        }

        // グローバルフラグをチェック
        if (global.superUserInitialized) {
            logInfo('スーパーユーザーは既に作成済みです（メモリフラグあり）');
            return;
        }

        const existingSuperUser = await User.findOne({
            where: { role: 'superuser' }
        });

        if (!existingSuperUser) {
            const hashedPassword = await bcrypt.hash('superadmin1234', 10);
            await User.create({
                username: 'superadmin',
                email: 'admin@15ch.net',
                password: hashedPassword,
                role: 'superuser',
                isApproved: true,
                is_super_admin: true,
                submission_method: 'email',
                submission_contact: 'admin@15ch.net',
                documentStatus: 'approved',
                documentVerifiedAt: new Date()
            });
            logInfo('スーパーユーザーを作成しました');
            // グローバルフラグを設定
            global.superUserInitialized = true;
        } else {
            logInfo('スーパーユーザーは既に存在します');
            // 既存の場合もフラグを設定
            global.superUserInitialized = true;
        }
    } catch (error) {
        logError('スーパーユーザーの作成に失敗しました:', error);
        logInfo('スーパーユーザーの作成に失敗しましたが、処理を続行します');
    }
};

module.exports = createSuperUser; 