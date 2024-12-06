const Sequelize = require('sequelize');
const sequelize = require('../db'); // Adjust path to your Sequelize instance
const User = require('./User');
const Template = require('./Template');

// Define associations
User.hasMany(Template, { foreignKey: 'createdBy' }); // A user can have many templates
Template.belongsTo(User, { foreignKey: 'createdBy' }); // A template belongs to a user

// Export models and Sequelize instance
module.exports = {
    sequelize,
    Sequelize,
    User,
    Template,
};