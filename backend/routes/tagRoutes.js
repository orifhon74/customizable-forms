// routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Tag, TemplateTag} = require('../models');
const sequelize = require('../db');

/**
 * GET /api/tags/autocomplete?query=...
 * - Returns tags starting with the query
 */
router.get('/autocomplete', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    try {
        const tags = await Tag.findAll({
            where: {
                name: { [Op.like]: `${query}%` },
            },
            limit: 10,
        });
        res.json(tags);
    } catch (err) {
        console.error('Tag autocomplete error:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

router.get('/tags/cloud', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: [
                {
                    model: TemplateTag,
                    attributes: [],
                },
            ],
            attributes: [
                'name',
                [sequelize.fn('COUNT', sequelize.col('TemplateTags.template_id')), 'usage_count'],
            ],
            group: ['Tag.id'],
            order: [[sequelize.literal('usage_count'), 'DESC']],
            limit: 10, // Customize the number of tags shown in the cloud
        });
        res.json(tags);
    } catch (err) {
        console.error('Error fetching tag cloud:', err);
        res.status(500).json({ error: 'Failed to fetch tag cloud' });
    }
});

module.exports = router;