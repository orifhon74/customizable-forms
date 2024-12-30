// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { Comment, Template, User } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * GET /api/comments/template/:templateId
 * - Return all comments for a template in chronological order
 */
router.get('/template/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        // If you want only public or owned, you'd do a check:
        // But let's keep it open for demonstration. Or check the template's access_type.

        const comments = await Comment.findAll({
            where: { template_id: templateId },
            order: [['createdAt', 'ASC']],
            include: [{ model: User, attributes: ['id', 'username'] }],
        });
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

/**
 * POST /api/comments/template/:templateId
 * - Auth required. Adds a new comment.
 * - The comment text is in req.body.text
 */
router.post('/template/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        // Optionally check if template is public or user is allowed
        const comment = await Comment.create({
            user_id: req.user.id,
            template_id: templateId,
            text,
        });
        res.status(201).json(comment);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

module.exports = router;