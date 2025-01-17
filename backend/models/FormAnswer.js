// models/FormAnswer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Each FormAnswer references a "Form" (the submission)
 * and a "Question" (the question being answered).
 *
 * answer_value: we store the user's response as text.
 * If question_type is 'checkbox', you might store "true"/"false",
 * or parse booleans. Up to you.
 */
const FormAnswer = sequelize.define('FormAnswer', {
    answer_value: {
        type: DataTypes.TEXT,
        allowNull: true, // can be null if not answered
    },
    // We'll link formanswer -> form and question via foreignKeys
}, {
    timestamps: true,
});

module.exports = FormAnswer;