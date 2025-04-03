'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Thread, {
        foreignKey: 'threadId',
        as: 'thread'
      });
      Post.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author'
      });
      Post.hasMany(models.HelpfulLog, {
        foreignKey: 'postId',
        as: 'helpfulLogs'
      });
    }
  }

  Post.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    threadId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true // 匿名投稿を許可
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '名無しさん'
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts'
  });

  return Post;
}; 