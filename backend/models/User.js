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
        defaultValue: 'user',
    },
}, {
    timestamps: true,
    paranoid: true, // enables soft deletes
});

module.exports = User;