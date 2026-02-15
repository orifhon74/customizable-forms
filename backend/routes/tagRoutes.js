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
 * - Uses LEFT JOIN (required: false) so it doesn't crash when:
 *   - there are tags with zero templates
 *   - there are zero tags at all
 * - Uses stable COUNT with correct aliasing
 */
router.get('/cloud', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            // LEFT JOIN so tags without templates don't break the query
            include: [
                {
                    model: Template,
                    attributes: [],                 // don't fetch template columns
                    through: { attributes: [] },    // don't fetch join table columns
                    required: false,                // <-- LEFT JOIN (important)
                },
            ],
            attributes: [
                'id',
                'name',
                // COUNT templates per tag
                [sequelize.fn('COUNT', sequelize.col('Templates.id')), 'count'],
            ],
            group: ['Tag.id', 'Tag.name'],
            order: [[sequelize.literal('count'), 'DESC']],
        });

        // Return plain JSON, and make sure count is a number (Sequelize may return string)
        const result = tags.map(t => ({
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