const bcrypt = require('bcrypt');
const { User } = require('../models');

const createTestUsers = async () => {
    try {
        // テストユーザー1（メール）
        await User.create({
            username: 'test_user1',
            email: 'test1@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'user',
            isApproved: false,
            submissionMethod: 'email',
            submissionContact: 'test1@example.com'
        });

        // テストユーザー2（LINE）
        await User.create({
            username: 'test_user2',
            email: 'test2@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'user',
            isApproved: false,
            submissionMethod: 'line',
            submissionContact: 'line_id_2'
        });

        // テストユーザー3（メール）
        await User.create({
            username: 'test_user3',
            email: 'test3@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'user',
            isApproved: false,
            submissionMethod: 'email',
            submissionContact: 'test3@example.com'
        });

        // テストユーザー4（LINE）
        await User.create({
            username: 'test_user4',
            email: 'test4@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'user',
            isApproved: false,
            submissionMethod: 'line',
            submissionContact: 'line_id_4'
        });

        console.log('テストユーザーを作成しました');
    } catch (error) {
        console.error('テストユーザーの作成に失敗しました:', error);
        throw error;
    }
};

module.exports = createTestUsers; 