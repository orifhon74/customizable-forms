const express = require('express');
const router = express.Router();
const Template = require('../models/template'); // Adjust to the path of your Template model
const authenticate = require('../middleware/authenticate'); // Middleware to protect routes

// Create a new template
router.post('/', authenticate, async (req, res) => {
    console.log('Authenticated user:', req.user); // Debugging log

    const { title, description, tags } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const template = await Template.create({
            title,
            description,
            tags,
            createdBy: req.user.id, // Use user ID from the token
        });

        res.status(201).json(template);
    } catch (err) {
        console.error('Error creating template:', err);
        res.status(500).json({ error: 'Failed to create template', details: err.message });
    }
});

// Get all templates
router.get('/', async (req, res) => {
    try {
        const templates = await Template.findAll();
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates', details: error.message });
    }
});

// Edit a template
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const template = await Template.findByPk(req.params.id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        if (template.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to edit this template' });
        }

        await template.update({ title, description, tags });
        res.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template', details: error.message });
    }
});

// Delete a template
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        if (template.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this template' });
        }

        await template.destroy();
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template', details: error.message });
    }
});

module.exports = router;