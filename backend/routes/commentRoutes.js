const express = require('express');
const router = express.Router();
const { Comment } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * POST /api/comments
 * Add a new comment
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { template_id, content } = req.body;
        if (!template_id || !content) {
            return res.status(400).json({ error: 'Template ID and content are required' });
        }

        const comment = await Comment.create({
            template_id,
            user_id: req.user.id,
            content,
        });

        res.status(201).json(comment);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

/**
 * GET /api/comments/:templateId
 * Get comments for a specific template
 */
router.get('/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const comments = await Comment.findAll({ where: { template_id: templateId } });
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

module.exports = router;