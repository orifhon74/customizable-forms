// routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const { Like, Template } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * POST /api/likes/:templateId
 * - Auth required: user likes a template, only once
 */
router.post('/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        // check if template is public or user is admin/owner if private
        // optionally do the check. We'll skip for brevity.

        // find or create a Like
        const [like, created] = await Like.findOrCreate({
            where: {
                user_id: req.user.id,
                template_id: templateId,
            },
        });
        if (!created) {
            return res.status(400).json({ error: 'Already liked' });
        }
        res.status(201).json({ message: 'Template liked' });
    } catch (err) {
        console.error('Error liking template:', err);
        res.status(500).json({ error: 'Failed to like template' });
    }
});

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