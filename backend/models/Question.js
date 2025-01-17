// models/Question.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * The Question model stores an unlimited number of questions
 * associated with each Template.
 *
 * question_text: The prompt or label of the question
 * question_type: e.g. 'string', 'multiline', 'integer', 'checkbox', etc.
 */
const Question = sequelize.define('Question', {
    question_text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    question_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // We'll link question -> template via foreignKey 'template_id'
}, {
    timestamps: true,
});

module.exports = Question;