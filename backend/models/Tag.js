const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Tag = sequelize.define('Tag', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure it's unique
        validate: {
            len: [1, 255], // Optional: Ensure length is valid
        }
    },
}, {
    timestamps: true,
    indexes: [ // Explicitly define the unique constraint to avoid duplication
        {
            unique: true,
            fields: ['name']
        }
    ]
});

module.exports = Tag;