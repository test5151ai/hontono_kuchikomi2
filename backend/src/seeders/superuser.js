const bcrypt = require('bcrypt');
const { User } = require('../models');

const createSuperUser = async () => {
    try {
        const existingSuperUser = await User.findOne({
            where: { role: 'superuser' }
        });

        if (!existingSuperUser) {
            const hashedPassword = await bcrypt.hash(process.env.SUPERUSER_PASSWORD, 10);
            await User.create({
                username: process.env.SUPERUSER_USERNAME,
                email: process.env.SUPERUSER_EMAIL,
                password: hashedPassword,
                role: 'superuser',
                isApproved: true,
                isSuperAdmin: true,
                submissionMethod: 'email',
                submissionContact: process.env.SUPERUSER_EMAIL
            });
            console.log('スーパーユーザーを作成しました');
        } else {
            console.log('スーパーユーザーは既に存在します');
        }
    } catch (error) {
        console.error('スーパーユーザーの作成に失敗しました:', error);
        throw error;
    }
};

module.exports = createSuperUser; 