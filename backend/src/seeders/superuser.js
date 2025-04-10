const bcrypt = require('bcrypt');
const { User, sequelize } = require('../models');

const createSuperUser = async () => {
    try {
        // テーブルの存在を確認
        try {
            // ユーザーテーブルの存在を確認するためのクエリを実行
            await sequelize.query('SELECT 1 FROM users LIMIT 1');
            console.log('usersテーブルが正常に確認できました');
        } catch (tableErr) {
            // テーブルが存在しない場合はエラーをスローしてキャッチ
            console.error('usersテーブルが見つかりません。マイグレーションが必要です:', tableErr.message);
            console.log('スーパーユーザー作成をスキップします');
            return; // 早期リターンでスーパーユーザー作成をスキップ
        }

        // グローバルフラグをチェック
        if (global.superUserInitialized) {
            console.log('スーパーユーザーは既に作成済みです（メモリフラグあり）');
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
                isSuperAdmin: true,
                submissionMethod: 'email',
                submissionContact: 'admin@15ch.net',
                documentStatus: 'approved',
                documentVerifiedAt: new Date()
            });
            console.log('スーパーユーザーを作成しました');
            // グローバルフラグを設定
            global.superUserInitialized = true;
        } else {
            console.log('スーパーユーザーは既に存在します');
            // 既存の場合もフラグを設定
            global.superUserInitialized = true;
        }
    } catch (error) {
        console.error('スーパーユーザーの作成に失敗しました:', error);
        console.log('スーパーユーザーの作成に失敗しましたが、処理を続行します');
    }
};

module.exports = createSuperUser; 