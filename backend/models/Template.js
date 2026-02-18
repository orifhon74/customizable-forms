// models/Template.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // your Sequelize instance

/**
 * The Template model stores general info about the template:
 * title, description, user_id, topic_id, access_type, image_url, etc.
 *
 * All questions are stored in the separate "Question" model.
 */
const Template = sequelize.define(
    'Template',
    {
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
            allowNull: false,
        },

        topic_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        access_type: {
            type: DataTypes.STRING, // 'public' or 'private'
            defaultValue: 'public',
        },

        /**
         * NEW: whether the template owner allows submitters to edit their submissions.
         * default false keeps things “form-submissions-are-final” unless explicitly enabled.
         */
        allow_editing: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Template;