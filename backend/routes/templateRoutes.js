const express = require('express');
const router = express.Router();
const Template = require('../models/Template'); // Sequelize Template model
const authenticate = require('../middleware/authenticate'); // JWT authentication middleware
const Form = require('../models/Form');
const sequelize = require('sequelize');

// Create a new template
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title,
            description,
            image_url,
            topic_id,
            custom_string1_state,
            custom_string1_question,
            custom_int1_state,
            custom_int1_question,
            custom_checkbox1_state,
            custom_checkbox1_question,
            access_type,
            allowed_users,
        } = req.body;

        const template = await Template.create({
            title,
            description,
            image_url,
            user_id: req.user.id, // ID from the authenticated user
            topic_id,
            custom_string1_state,
            custom_string1_question,
            custom_int1_state,
            custom_int1_question,
            custom_checkbox1_state,
            custom_checkbox1_question,
            access_type, // "public" or "private"
            allowed_users, // Array of user IDs (for private templates)
        });

        res.status(201).json(template);
    } catch (err) {
        console.error('Error creating template:', err);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Get all templates (public or owned by user)
router.get('/', authenticate, async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: {
                [sequelize.Op.or]: [
                    { user_id: req.user.id }, // Templates created by the user
                    { access_type: 'public' }, // Public templates
                ],
            },
        });
        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Get a specific template by ID
router.get('/:templateId', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.templateId);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check access permissions
        if (
            template.access_type === 'private' &&
            template.user_id !== req.user.id &&
            (!template.allowed_users || !template.allowed_users.includes(req.user.id))
        ) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(template);
    } catch (err) {
        console.error('Error fetching template:', err);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Update a template
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const template = await Template.findByPk(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check ownership
        if (template.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to update this template' });
        }

        await template.update(updates);
        res.json(template);
    } catch (err) {
        console.error('Error updating template:', err);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete a template
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const template = await Template.findByPk(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check ownership
        if (template.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to delete this template' });
        }

        await template.destroy();
        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (err) {
        console.error('Error deleting template:', err);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// Get stats for a specific template
router.get('/:templateId/stats', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        const stats = await Form.findAll({
            where: { template_id: templateId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('int1_answer')), 'avg_int1'],
                [sequelize.fn('COUNT', sequelize.col('checkbox1_answer')), 'checkbox1_count'],
                [sequelize.fn('SUM', sequelize.col('checkbox1_answer')), 'checkbox1_true_count'],
            ],
        });

        res.json(stats);
    } catch (err) {
        console.error('Error calculating stats:', err);
        res.status(500).json({ error: 'Failed to calculate stats' });
    }
});

module.exports = router;