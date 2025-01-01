// routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const { Like } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * POST /api/likes
 * Add a like
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { template_id } = req.body;
        if (!template_id) {
            return res.status(400).json({ error: 'Template ID is required' });
        }

        const existingLike = await Like.findOne({
            where: { template_id, user_id: req.user.id },
        });

        if (existingLike) {
            return res.status(400).json({ error: 'User has already liked this template' });
        }

        const like = await Like.create({
            template_id,
            user_id: req.user.id,
        });

        res.status(201).json(like);
    } catch (err) {
        console.error('Error adding like:', err.message);
        res.status(500).json({ error: 'Failed to add like' });
    }
});

/**
 * GET /api/likes/:templateId
 * Get like count for a specific template
 */
router.get('/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const likeCount = await Like.count({ where: { template_id: templateId } });
        res.json({ likeCount });
    } catch (err) {
        console.error('Error fetching likes:', err);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
});

module.exports = router;

/**
 * DELETE /api/likes/:templateId
 * - Auth required: user unlikes
 */
router.delete('/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        const like = await Like.findOne({
            where: { user_id: req.user.id, template_id: templateId },
        });
        if (!like) {
            return res.status(404).json({ error: 'Like not found' });
        }
        await like.destroy();
        res.json({ message: 'Template unliked' });
    } catch (err) {
        console.error('Error unliking template:', err);
        res.status(500).json({ error: 'Failed to unlike template' });
    }
});

module.exports = router;