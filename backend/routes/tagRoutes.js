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
 * Privacy fix:
 * - Only return tags that have at least ONE *public* template.
 * - Prevents leaking the existence of private templates via tags.
 */
router.get('/cloud', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: [
                {
                    model: Template,
                    attributes: [],
                    through: { attributes: [] },
                    required: true,                 // INNER JOIN: only tags w/ matching templates
                    where: { access_type: 'public' } // ✅ only public templates count
                },
            ],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('Templates.id')), 'count'],
            ],
            group: ['Tag.id', 'Tag.name'],
            // redundant with required:true + where, but ok to keep explicit
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