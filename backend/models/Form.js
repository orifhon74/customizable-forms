const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Template = require('./Template'); // Assuming Template model is already defined
const User = require('./User'); // Assuming User model is already defined

const Form = sequelize.define('Form', {
    // Foreign key for Template
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Template,
            key: 'id',
        },
    },

    // Foreign key for User
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },

    // String Answers
    string1_answer: { type: DataTypes.STRING, allowNull: true },
    string2_answer: { type: DataTypes.STRING, allowNull: true },
    string3_answer: { type: DataTypes.STRING, allowNull: true },
    string4_answer: { type: DataTypes.STRING, allowNull: true },

    // Integer Answers
    int1_answer: { type: DataTypes.INTEGER, allowNull: true },
    int2_answer: { type: DataTypes.INTEGER, allowNull: true },
    int3_answer: { type: DataTypes.INTEGER, allowNull: true },
    int4_answer: { type: DataTypes.INTEGER, allowNull: true },

    // Checkbox Answers
    checkbox1_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    checkbox2_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    checkbox3_answer: { type: DataTypes.BOOLEAN, allowNull: true },
    checkbox4_answer: { type: DataTypes.BOOLEAN, allowNull: true },
}, {
    timestamps: true,
    paranoid: true, // Enable soft deletes
});

// Associations
Template.hasMany(Form, { foreignKey: 'template_id', onDelete: 'CASCADE' });
Form.belongsTo(Template, { foreignKey: 'template_id' });

User.hasMany(Form, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Form.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Form;