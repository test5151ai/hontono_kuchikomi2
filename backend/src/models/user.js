'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // VerificationDocumentとの関連付け
      User.hasMany(models.VerificationDocument, { foreignKey: 'userId' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin', 'superuser']]
      }
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    submissionMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'email',
      validate: {
        isIn: [['email', 'line']]
      }
    },
    submissionContact: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'fas fa-user'
    },
    approvedAt: DataTypes.DATE,
    approvedBy: DataTypes.UUID,
    lastLoginAt: DataTypes.DATE,
    documentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'not_submitted',
      validate: {
        isIn: [['not_submitted', 'submitted', 'approved', 'rejected']]
      }
    },
    documentSubmittedAt: DataTypes.DATE,
    documentVerifiedAt: DataTypes.DATE,
    documentVerifiedBy: DataTypes.UUID,
    documentRejectReason: DataTypes.TEXT,
    documentPath: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};