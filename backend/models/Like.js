// models/Like.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Like = sequelize.define('Like', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    template_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
    timestamps: true,
    // Optionally, you can set unique index for user_id + template_id
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'template_id']
        }
    ]
});

module.exports = Like;