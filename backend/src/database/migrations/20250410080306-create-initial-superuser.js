'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // スーパーユーザーの存在確認
      const superusers = await queryInterface.sequelize.query(
        "SELECT * FROM users WHERE role = 'superuser' OR is_super_admin = true LIMIT 1;",
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (superusers.length === 0) {
        console.log('スーパーユーザーが存在しないため、初期スーパーユーザーを作成します...');
        
        // 環境変数から情報を取得（設定されていない場合はデフォルト値を使用）
        const username = process.env.SUPERUSER_USERNAME || 'superadmin';
        const email = process.env.SUPERUSER_EMAIL || 'admin@15ch.net';
        const password = process.env.SUPERUSER_PASSWORD || 'superadmin1234';
        
        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // スーパーユーザーの作成（idフィールドを明示的に指定）
        await queryInterface.bulkInsert('users', [{
          id: uuidv4(), // UUIDを明示的に生成
          username,
          email,
          password: hashedPassword,
          role: 'superuser',
          isApproved: true,
          is_super_admin: true,
          submission_method: 'email',
          submission_contact: email,
          documentStatus: 'approved',
          documentVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
        
        console.log('スーパーユーザーの作成が完了しました');
      } else {
        console.log('スーパーユーザーは既に存在します');
      }
    } catch (error) {
      console.error('スーパーユーザーの作成中にエラーが発生しました:', error);
      throw error; // マイグレーション失敗として扱う
    }
  },

  async down(queryInterface, Sequelize) {
    // ダウングレード時は何もしない（スーパーユーザーは削除しない）
    console.log('このマイグレーションに対するダウングレードは実装されていません（スーパーユーザーは保持されます）');
  }
};
