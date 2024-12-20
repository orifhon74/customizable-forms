const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Your database connection

const Template = sequelize.define('Template', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    image_url: { type: DataTypes.STRING, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    topic_id: { type: DataTypes.INTEGER, allowNull: false },

    // String Questions
    custom_string1_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_string1_question: { type: DataTypes.STRING, allowNull: true },
    custom_string2_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_string2_question: { type: DataTypes.STRING, allowNull: true },
    custom_string3_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_string3_question: { type: DataTypes.STRING, allowNull: true },
    custom_string4_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_string4_question: { type: DataTypes.STRING, allowNull: true },

    // Integer Questions
    custom_int1_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_int1_question: { type: DataTypes.STRING, allowNull: true },
    custom_int2_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_int2_question: { type: DataTypes.STRING, allowNull: true },
    custom_int3_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_int3_question: { type: DataTypes.STRING, allowNull: true },
    custom_int4_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_int4_question: { type: DataTypes.STRING, allowNull: true },

    // Checkbox Questions
    custom_checkbox1_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_checkbox1_question: { type: DataTypes.STRING, allowNull: true },
    custom_checkbox2_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_checkbox2_question: { type: DataTypes.STRING, allowNull: true },
    custom_checkbox3_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_checkbox3_question: { type: DataTypes.STRING, allowNull: true },
    custom_checkbox4_state: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_checkbox4_question: { type: DataTypes.STRING, allowNull: true },
}, {
    timestamps: true,
});

module.exports = Template;