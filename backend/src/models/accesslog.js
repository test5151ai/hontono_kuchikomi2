'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    static associate(models) {
      // ユーザーとの関連付け
      AccessLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // スレッドとの関連付け
      AccessLog.belongsTo(models.Thread, {
        foreignKey: 'threadId',
        as: 'thread'
      });
    }
  }
  
  AccessLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    threadId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referer: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AccessLog',
  });
  
  return AccessLog;
}; 