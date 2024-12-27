const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import Sequelize instance
const Template = require('./Template'); // Import Template model
const User = require('./User'); // Import User model

const Form = sequelize.define(
    'Form',
    {
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        string1_answer: { type: DataTypes.STRING, allowNull: true },
        string2_answer: { type: DataTypes.STRING, allowNull: true },
        string3_answer: { type: DataTypes.STRING, allowNull: true },
        string4_answer: { type: DataTypes.STRING, allowNull: true },
        multiline1_answer: { type: DataTypes.TEXT, allowNull: true },
        multiline2_answer: { type: DataTypes.TEXT, allowNull: true },
        multiline3_answer: { type: DataTypes.TEXT, allowNull: true },
        multiline4_answer: { type: DataTypes.TEXT, allowNull: true },
        int1_answer: { type: DataTypes.INTEGER, allowNull: true },
        int2_answer: { type: DataTypes.INTEGER, allowNull: true },
        int3_answer: { type: DataTypes.INTEGER, allowNull: true },
        int4_answer: { type: DataTypes.INTEGER, allowNull: true },
        checkbox1_answer: { type: DataTypes.BOOLEAN, allowNull: true },
        checkbox2_answer: { type: DataTypes.BOOLEAN, allowNull: true },
        checkbox3_answer: { type: DataTypes.BOOLEAN, allowNull: true },
        checkbox4_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    },
    {
        timestamps: true,
        paranoid: true, // Enable soft deletes
    }
);

module.exports = Form;