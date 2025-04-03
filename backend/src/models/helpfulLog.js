'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HelpfulLog extends Model {
    static associate(models) {
      HelpfulLog.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
      });
      HelpfulLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  HelpfulLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true // 非ログインユーザーの場合はnull
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'HelpfulLog',
    tableName: 'helpful_logs',
    indexes: [
      {
        unique: true,
        fields: ['postId', 'ipAddress', 'sessionId'],
        name: 'idx_helpful_logs_unique_vote'
      },
      {
        fields: ['postId'],
        name: 'idx_helpful_logs_post_id'
      },
      {
        fields: ['userId'],
        name: 'idx_helpful_logs_user_id'
      }
    ]
  });

  return HelpfulLog;
}; 