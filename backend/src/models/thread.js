'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Thread extends Model {
    static associate(models) {
      Thread.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Thread.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author'
      });
      Thread.hasMany(models.Post, {
        foreignKey: 'threadId',
        as: 'posts'
      });
    }
  }

  Thread.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    shopUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shopDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Thread',
    tableName: 'threads'
  });

  return Thread;
}; 