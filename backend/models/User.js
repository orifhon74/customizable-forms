// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'username_unique_constraint',
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'email_unique_constraint',
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // or 'admin'
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'en', // 'en' or 'uz'
    },
}, {
    timestamps: true,
    paranoid: true, // soft delete
});

module.exports = User;