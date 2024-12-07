const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db'); // Adjust to your Sequelize instance

class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // Default role is 'user'
    },
}, {
    sequelize, // Pass the Sequelize instance
    modelName: 'User', // Name of the model
    timestamps: true, // Add createdAt and updatedAt
    paranoid: true, // Enable soft deletes
});

module.exports = User;