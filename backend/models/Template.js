// models/Template.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // your Sequelize instance

/**
 * The Template model now only stores general info about the template:
 * title, description, user_id, topic_id, etc.
 *
 * We remove or never add the old columns like custom_string1_question, etc.
 * All questions are stored in the separate "Question" model.
 */
const Template = sequelize.define('Template', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // reference to your user
    },
    topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // you can still map "Education" => 1, "Quiz" => 2, "Other" => 3, etc. in the routes
    },
    access_type: {
        type: DataTypes.STRING, // 'public' or 'private'
        defaultValue: 'public',
    },
}, {
    timestamps: true,
    // tableName: 'Templates', // optional if you want a custom table name
});

module.exports = Template;