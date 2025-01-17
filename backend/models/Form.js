// models/Form.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * A "Form" record represents one submission from a user for a given template.
 *
 * Instead of having columns like custom_string1_answer,
 * we store answers in a separate "FormAnswer" model.
 */
const Form = sequelize.define('Form', {
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // the user who submitted the form
    },
}, {
    timestamps: true,
});

module.exports = Form;