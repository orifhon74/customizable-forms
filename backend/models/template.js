const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db'); // Adjust to your Sequelize instance

class Template extends Model {}

Template.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tags: {
        type: DataTypes.JSON, // Use JSON for storing tags
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false, // Foreign key to the User model
    },
}, {
    sequelize, // Pass the Sequelize instance
    modelName: 'Template', // Name of the model
    timestamps: true, // Add createdAt and updatedAt
    paranoid: true, // Enable soft deletes
});

module.exports = Template;