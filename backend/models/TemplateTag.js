// models/TemplateTag.js
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const TemplateTag = sequelize.define(
    'TemplateTag',
    {
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Templates', // MUST match actual table name
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        tag_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Tags', // MUST match actual table name
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    },
    {
        tableName: 'TemplateTags', // explicit = no Sequelize guessing
        timestamps: false,
    }
);

module.exports = TemplateTag;