const express = require('express');
const router = express.Router();
const { Comment, User } = require('../models'); // Assuming you have a User model for user details
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

        // Include the user's information in the response
        const commentWithUser = await Comment.findOne({
            where: { id: comment.id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username'], // Include any user attributes you want
                },
            ],
        });

        res.status(201).json(commentWithUser);
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
        const comments = await Comment.findAll({
            where: { template_id: templateId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username'], // Include user information in comments
                },
            ],
            order: [['createdAt', 'DESC']], // Order comments by the newest first
        });

        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

/**
 * DELETE /api/comments/:id
 * Delete a comment (admin or the user who created the comment)
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Allow only the owner of the comment or an admin to delete it
        if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await comment.destroy();
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;