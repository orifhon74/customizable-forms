// models/Comment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Comment = sequelize.define('Comment', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    template_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
}, {
    timestamps: true,
});

module.exports = Comment;