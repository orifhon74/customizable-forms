// models/Form.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Form = sequelize.define('Form', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    template_id: { type: DataTypes.INTEGER, allowNull: false },

    // Matching answer fields
    custom_string1_answer: { type: DataTypes.STRING, allowNull: true },
    custom_string2_answer: { type: DataTypes.STRING, allowNull: true },
    custom_string3_answer: { type: DataTypes.STRING, allowNull: true },
    custom_string4_answer: { type: DataTypes.STRING, allowNull: true },

    custom_multiline1_answer: { type: DataTypes.TEXT, allowNull: true },
    custom_multiline2_answer: { type: DataTypes.TEXT, allowNull: true },
    custom_multiline3_answer: { type: DataTypes.TEXT, allowNull: true },
    custom_multiline4_answer: { type: DataTypes.TEXT, allowNull: true },

    custom_int1_answer: { type: DataTypes.INTEGER, allowNull: true },
    custom_int2_answer: { type: DataTypes.INTEGER, allowNull: true },
    custom_int3_answer: { type: DataTypes.INTEGER, allowNull: true },
    custom_int4_answer: { type: DataTypes.INTEGER, allowNull: true },

    custom_checkbox1_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    custom_checkbox2_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    custom_checkbox3_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    custom_checkbox4_answer: { type: DataTypes.BOOLEAN, allowNull: true },
}, {
    timestamps: true,
});

module.exports = Form;