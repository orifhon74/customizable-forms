// models/index.js

const sequelize = require('../db');

// Import models
const User = require('./User');
const Template = require('./Template');
const Form = require('./Form');
const Comment = require('./Comment');
const Like = require('./Like');
const Tag = require('./Tag');
const TemplateTag = require('./TemplateTag');
const FormAnswer = require('./FormAnswer');
const Question = require('./Question');

/**
 * -------------------------------------------
 * 1) USER RELATIONSHIPS
 * -------------------------------------------
 */

// A user can have many forms (submissions)
User.hasMany(Form, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});
Form.belongsTo(User, {
    foreignKey: 'user_id',
});

// A user can have many templates
User.hasMany(Template, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE', // so if user is deleted, templates go away
});
Template.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// A user can have many comments
User.hasMany(Comment, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});
Comment.belongsTo(User, {
    foreignKey: 'user_id',
});

// A user can have many likes
User.hasMany(Like, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});
Like.belongsTo(User, {
    foreignKey: 'user_id',
});

/**
 * -------------------------------------------
 * 2) TEMPLATE RELATIONSHIPS
 * -------------------------------------------
 */

// A template can have many forms (one-to-many)
Template.hasMany(Form, {
    foreignKey: 'template_id',
    onDelete: 'CASCADE',
});
Form.belongsTo(Template, {
    foreignKey: 'template_id',
});

// A template can have many comments (one-to-many)
Template.hasMany(Comment, {
    foreignKey: 'template_id',
    onDelete: 'CASCADE',
});
Comment.belongsTo(Template, {
    foreignKey: 'template_id',
});

// A template can have many likes (one-to-many)
Template.hasMany(Like, {
    foreignKey: 'template_id',
    onDelete: 'CASCADE',
});
Like.belongsTo(Template, {
    foreignKey: 'template_id',
});

// Many-to-many: Template <-> Tag via TemplateTag
Template.belongsToMany(Tag, {
    through: TemplateTag,
    foreignKey: 'template_id',
    otherKey: 'tag_id',
    constraints: true,
    onDelete: 'CASCADE',
});

Tag.belongsToMany(Template, {
    through: TemplateTag,
    foreignKey: 'tag_id',
    otherKey: 'template_id',
    constraints: true,
    onDelete: 'CASCADE',
});

/**
 * -------------------------------------------
 * 3) QUESTION (UNLIMITED QUESTIONS)
 * -------------------------------------------
 * - A template can have many questions
 * - Each question belongs to exactly one template
 */

Template.hasMany(Question, {
    foreignKey: 'template_id',
    onDelete: 'CASCADE',
});
Question.belongsTo(Template, {
    foreignKey: 'template_id',
});

/**
 * -------------------------------------------
 * 4) FORM ANSWERS (UNLIMITED ANSWERS)
 * -------------------------------------------
 * - A Form can have many FormAnswers
 * - A Question can have many FormAnswers
 * - Each FormAnswer references exactly one Form and one Question
 */

// A form can have many FormAnswers
Form.hasMany(FormAnswer, {
    foreignKey: 'form_id',
    onDelete: 'CASCADE',
});
FormAnswer.belongsTo(Form, {
    foreignKey: 'form_id',
});

// A question can have many FormAnswers
Question.hasMany(FormAnswer, {
    foreignKey: 'question_id',
    onDelete: 'CASCADE',
});
FormAnswer.belongsTo(Question, {
    foreignKey: 'question_id',
});

/**
 * -------------------------------------------
 * EXPORT
 * -------------------------------------------
 * Finally, export everything via an object.
 */

module.exports = {
    sequelize,    // The Sequelize instance
    User,
    Template,
    Form,
    Comment,
    Like,
    Tag,
    TemplateTag,
    FormAnswer,
    Question,
};