// routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Tag } = require('../models');

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

module.exports = router;