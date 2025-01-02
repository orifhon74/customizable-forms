const express = require('express');
const router = express.Router();
const { Tag, Template } = require('../models');
const sequelize = require('../db');

/**
 * GET /api/tags/cloud
 * Returns the tag cloud (tags and their template counts)
 */
router.get('/cloud', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: {
                model: Template,
                through: { attributes: [] }, // Include association without extra join table columns
                attributes: [], // We only need to count associated templates
            },
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('Templates.id')), 'count'], // Count templates
            ],
            group: ['Tag.id', 'Tag.name'], // Ensure all selected columns are included in GROUP BY
            order: [[sequelize.literal('count'), 'DESC']], // Order by template count
        });

        res.json(tags);
    } catch (err) {
        console.error('Error fetching tag cloud:', err.message);
        res.status(500).json({ error: 'Failed to fetch tag cloud' });
    }
});


module.exports = router;