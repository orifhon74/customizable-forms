// routes/userSearchRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * GET /api/users/search?query=...
 * - Auth required
 * - Autocomplete by username or email
 */
router.get('/search', authenticate, async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email'],
            where: {
                [Op.or]: [
                    { username: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } },
                ],
            },
            limit: 10,
        });
        res.json(users);
    } catch (err) {
        console.error('User search error:', err);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

module.exports = router;