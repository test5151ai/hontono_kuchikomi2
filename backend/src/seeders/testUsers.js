const bcrypt = require('bcrypt');
const { User } = require('../models');

const createTestUsers = async () => {
    try {
        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash('udon1234', 10);
        
        const testUsers = [
            // 一般ユーザー
            {
                username: 'udon1',
                email: 'udon1@gmail.com',
                password: hashedPassword,
                role: 'user',
                submissionMethod: 'email',
                submissionContact: 'udon1@gmail.com',
                isApproved: true,
                documentStatus: 'approved',
                documentVerifiedAt: new Date()
            },
            {
                username: 'udon2',
                email: 'udon2@gmail.com',
                password: hashedPassword,
                role: 'user',
                submissionMethod: 'email',
                submissionContact: 'udon2@gmail.com',
                isApproved: true,
                documentStatus: 'approved',
                documentVerifiedAt: new Date()
            },
            {
                username: 'udon3',
                email: 'udon3@gmail.com',
                password: hashedPassword,
                role: 'user',
                submissionMethod: 'email',
                submissionContact: 'udon3@gmail.com',
                isApproved: true,
                documentStatus: 'approved',
                documentVerifiedAt: new Date()
            },
            // 管理者
            {
                username: 'kanriudon',
                email: 'kanriudon@gmail.com',
                password: hashedPassword,
                role: 'admin',
                submissionMethod: 'email',
                submissionContact: 'kanriudon@gmail.com',
                isApproved: true,
                documentStatus: 'approved',
                documentVerifiedAt: new Date()
            },
            // スーパーユーザー
            {
                username: 'superudon',
                email: 'superudon@gmail.com',
                password: hashedPassword,
                role: 'superuser',
                submissionMethod: 'email',
                submissionContact: 'superudon@gmail.com',
                isApproved: true,
                documentStatus: 'approved',
                documentVerifiedAt: new Date(),
                isSuperAdmin: true
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({
                where: { email: userData.email }
            });

            if (!existingUser) {
                await User.create(userData);
                console.log(`テストユーザー ${userData.username} を作成しました`);
            } else {
                // 既存ユーザーの情報を更新
                await existingUser.update(userData);
                console.log(`既存ユーザー ${userData.username} の情報を更新しました`);
            }
        }

        console.log('テストユーザーの作成処理が完了しました');
    } catch (error) {
        console.error('テストユーザーの作成に失敗しました:', error);
        throw error;
    }
};

module.exports = createTestUsers; 