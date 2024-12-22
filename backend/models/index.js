const sequelize = require('../db'); // Your Sequelize instance
const User = require('./User');
const Template = require('./Template');
const Form = require('./Form');

// Define Associations
Template.hasMany(Form, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Form.belongsTo(Template, { foreignKey: 'template_id' });

User.hasMany(Form, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Form.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    Template,
    Form,
};