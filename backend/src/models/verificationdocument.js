'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VerificationDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Userモデルとの関連付け
      VerificationDocument.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  VerificationDocument.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    documentPath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'identity',
      validate: {
        isIn: [['identity', 'address', 'other']]
      }
    },
    documentName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: DataTypes.DATE,
    verifiedBy: DataTypes.UUID,
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'VerificationDocument',
  });
  return VerificationDocument;
};