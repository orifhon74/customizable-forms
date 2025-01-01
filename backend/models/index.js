// models/index.js
const sequelize = require('../db');
const User = require('./User');
const Template = require('./Template');
const Form = require('./Form');
const Comment = require('./Comment');
const Like = require('./Like');
const Tag = require('./Tag');
const TemplateTag = require('./TemplateTag');

// Existing associations
User.hasMany(Form, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Form.belongsTo(User, { foreignKey: 'user_id' });

Template.hasMany(Form, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Form.belongsTo(Template, { foreignKey: 'template_id' });

// Comments association
Template.hasMany(Comment, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Comment.belongsTo(Template, { foreignKey: 'template_id' });

User.hasMany(Comment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Likes association
Template.hasMany(Like, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Like.belongsTo(Template, { foreignKey: 'template_id' });

User.hasMany(Like, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'user_id' });

Template.belongsToMany(Tag, { through: TemplateTag, foreignKey: 'template_id' });
Tag.belongsToMany(Template, { through: TemplateTag, foreignKey: 'tag_id' });

module.exports = {
    sequelize,
    User,
    Template,
    Form,
    Comment,
    Like,
    Tag,
    TemplateTag,
};