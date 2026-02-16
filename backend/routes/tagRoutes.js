// routes/tagRoutes.js
'use strict';

const express = require('express');
const router = express.Router();

const { Tag, Template } = require('../models');
const sequelize = require('../db');

/**
 * GET /api/tags/cloud
 * Returns tag cloud: [{ id, name, count }]
 *
 * Fix: exclude tags with zero templates
 * - Uses INNER JOIN (required: true)
 * - Adds HAVING COUNT(Templates.id) > 0 to be explicit
 */
router.get('/cloud', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: [
                {
                    model: Template,
                    attributes: [],
                    through: { attributes: [] },
                    required: true, // <-- INNER JOIN: only tags attached to at least 1 template
                },
            ],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('Templates.id')), 'count'],
            ],
            group: ['Tag.id', 'Tag.name'],
            having: sequelize.where(
                sequelize.fn('COUNT', sequelize.col('Templates.id')),
                '>',
                0
            ),
            order: [[sequelize.literal('count'), 'DESC']],
        });

        const result = tags.map((t) => ({
            id: t.id,
            name: t.name,
            count: Number(t.get('count')) || 0,
        }));

        return res.json(result);
    } catch (err) {
        console.error('❌ Error fetching tag cloud:', err);
        return res.status(500).json({
            error: 'Failed to fetch tag cloud',
            details: err.message,
        });
    }
});

module.exports = router;