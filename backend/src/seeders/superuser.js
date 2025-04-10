const bcrypt = require('bcrypt');
const { User } = require('../models');

const createSuperUser = async () => {
    try {
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
        } else {
            console.log('スーパーユーザーは既に存在します');
        }
    } catch (error) {
        console.error('スーパーユーザーの作成に失敗しました:', error);
        console.log('スーパーユーザーの作成に失敗しましたが、処理を続行します');
    }
};

module.exports = createSuperUser; 