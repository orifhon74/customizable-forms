// models/TemplateTag.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const TemplateTag = sequelize.define('TemplateTag', {
    template_id: { type: DataTypes.INTEGER, allowNull: false },
    tag_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
    timestamps: false, // No need for timestamps in the join table
});

module.exports = TemplateTag;