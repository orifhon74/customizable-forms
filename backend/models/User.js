const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' },
}, {
    timestamps: true,
    paranoid: true, // Enable soft deletes
});

sequelize.sync({ force: true }) // WARNING: This will drop and recreate all tables
    .then(() => console.log('Database synced'))
    .catch((error) => console.error('Error syncing database:', error));

module.exports = User;