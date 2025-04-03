const bcrypt = require('bcrypt');
const { User } = require('../models');

const createTestUsers = async () => {
    try {
        const testUsers = [
            {
                username: 'test_user1',
                email: 'test1@example.com',
                submissionMethod: 'email',
                submissionContact: 'test1@example.com'
            },
            {
                username: 'test_user2',
                email: 'test2@example.com',
                submissionMethod: 'line',
                submissionContact: 'line_id_2'
            },
            {
                username: 'test_user3',
                email: 'test3@example.com',
                submissionMethod: 'email',
                submissionContact: 'test3@example.com'
            },
            {
                username: 'test_user4',
                email: 'test4@example.com',
                submissionMethod: 'line',
                submissionContact: 'line_id_4'
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({
                where: { username: userData.username }
            });

            if (!existingUser) {
                await User.create({
                    ...userData,
                    password: await bcrypt.hash('password123', 10),
                    role: 'user',
                    isApproved: false
                });
                console.log(`テストユーザー ${userData.username} を作成しました`);
            }
        }

        console.log('テストユーザーの作成処理が完了しました');
    } catch (error) {
        console.error('テストユーザーの作成に失敗しました:', error);
        throw error;
    }
};

module.exports = createTestUsers; 