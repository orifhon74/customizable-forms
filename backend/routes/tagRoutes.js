const express = require('express');
const router = express.Router();
const { Tag, Template } = require('../models');
const sequelize = require('../db');

/**
 * GET /api/tags/cloud
 * Fetch all tags with their template counts
 */
router.get('/cloud', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: [
                {
                    model: Template,
                    attributes: ['id'], // Only fetch template IDs to count
                },
            ],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('Templates.id')), 'templateCount'], // Count templates per tag
            ],
            group: ['Tag.id'], // Group by tag ID
        });

        res.json(tags);
    } catch (err) {
        console.error('Error fetching tag cloud:', err.message);
        res.status(500).json({ error: 'Failed to fetch tag cloud' });
    }
});

/**
 * GET /api/tags/:name/templates
 * Fetch templates by tag name
 */
router.get('/:name/templates', async (req, res) => {
    try {
        const { name } = req.params;
        const tag = await Tag.findOne({ where: { name } });

        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        const templates = await tag.getTemplates({
            where: { access_type: 'public' }, // Only public templates
            attributes: ['id', 'title', 'description', 'image_url', 'user_id'],
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates by tag:', err.message);
        res.status(500).json({ error: 'Failed to fetch templates by tag' });
    }
});

module.exports = router;