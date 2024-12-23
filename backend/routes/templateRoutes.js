const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const Form = require('../models/Form');
const authenticate = require('../middleware/authenticate'); // JWT authentication middleware
const authorizeAdmin = require('../middleware/authorizeAdmin'); // Admin middleware
// const sequelize = require('../db');
const { Op } = require('sequelize'); // Ensure this is properly imported

// Create a new template
router.post('/', authenticate, async (req, res) => {
    try {
        console.log('Incoming Template Payload:', req.body); // Debug incoming payload

        const {
            title,
            description,
            image_url,
            topic_id,
            access_type,
            custom_string1_state,
            custom_string1_question,
            custom_int1_state,
            custom_int1_question,
            custom_checkbox1_state,
            custom_checkbox1_question,
        } = req.body;

        // Validate required fields
        if (!title || !topic_id) {
            console.error('Validation Error: Missing required fields');
            return res.status(400).json({ error: 'Title and Topic ID are required' });
        }

        // Private templates are restricted to the creator by default
        const allowedUsers = access_type === 'private' ? [req.user.id] : null;

        // Create the template
        const template = await Template.create({
            title,
            description: description || null,
            image_url: image_url || null,
            user_id: req.user.id, // Authenticated user ID
            topic_id,
            access_type,
            allowed_users: allowedUsers,
            custom_string1_state: custom_string1_state || false,
            custom_string1_question: custom_string1_question || null,
            custom_int1_state: custom_int1_state || false,
            custom_int1_question: custom_int1_question || null,
            custom_checkbox1_state: custom_checkbox1_state || false,
            custom_checkbox1_question: custom_checkbox1_question || null,
        });

        console.log('Template Created Successfully:', template);
        res.status(201).json({ message: 'Template created successfully', template });
    } catch (err) {
        console.error('Error creating template:', err);
        res.status(500).json({ error: 'Failed to create template', details: err.message });
    }
});

// Get all templates (Admin sees all, users see public or their own)
router.get('/', authenticate, async (req, res) => {
    try {
        let templates;

        if (req.user.role === 'admin') {
            // Admin can see all templates
            templates = await Template.findAll();
        } else {
            // Regular users see only public templates or their own
            templates = await Template.findAll({
                where: {
                    [Op.or]: [
                        { access_type: 'public' },
                        { user_id: req.user.id },
                    ],
                },
            });
        }

        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Failed to fetch templates', details: err.message });
    }
});

// Get a single template
router.get('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Only allow access if public, user owns it, or admin
        if (
            template.access_type !== 'public' &&
            template.user_id !== req.user.id &&
            req.user.role !== 'admin'
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

        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
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

        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
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