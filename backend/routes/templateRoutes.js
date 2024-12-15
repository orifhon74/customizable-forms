const express = require('express');
const router = express.Router();
const Template = require('../models/template'); // Sequelize Template model
const authenticate = require('../middleware/authenticate'); // JWT authentication middleware

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
        });

        res.status(201).json(template);
    } catch (err) {
        console.error('Error creating template:', err);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Get all templates
router.get('/', authenticate, async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { user_id: req.user.id },
        });
        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Failed to fetch templates' });
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

module.exports = router;