const { User } = require('../models');
const bcrypt = require('bcryptjs');

const dummyUsers = [
    {
        username: 'test_user1',
        email: 'test1@example.com',
        password: 'password123',
        role: 'user',
        isApproved: false,
        submissionMethod: 'email',
        submissionContact: 'test1@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: 'test_user2',
        email: 'test2@example.com',
        password: 'password123',
        role: 'user',
        isApproved: false,
        submissionMethod: 'line',
        submissionContact: 'line_id_123',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: 'test_user3',
        email: 'test3@example.com',
        password: 'password123',
        role: 'user',
        isApproved: false,
        submissionMethod: 'email',
        submissionContact: 'test3@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: 'test_user4',
        email: 'test4@example.com',
        password: 'password123',
        role: 'user',
        isApproved: false,
        submissionMethod: 'line',
        submissionContact: 'line_id_456',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const seedUsers = async () => {
    try {
        // パスワードのハッシュ化
        const hashedUsers = await Promise.all(
            dummyUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        // ユーザーの作成
        await User.bulkCreate(hashedUsers, {
            ignoreDuplicates: true
        });

        console.log('ダミーユーザーデータの作成が完了しました');
    } catch (error) {
        console.error('ダミーユーザーデータの作成に失敗しました:', error);
    }
};

module.exports = seedUsers; 