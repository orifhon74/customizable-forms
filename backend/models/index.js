// models/index.js
const sequelize = require('../db');
const User = require('./User');
const Template = require('./Template');
const Form = require('./Form');

// Define associations
User.hasMany(Form, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Form.belongsTo(User, { foreignKey: 'user_id' });

Template.hasMany(Form, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Form.belongsTo(Template, { foreignKey: 'template_id' });

module.exports = {
    sequelize,
    User,
    Template,
    Form,
};