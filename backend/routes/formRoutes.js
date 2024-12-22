const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Template = require('../models/Template');
const authenticate = require('../middleware/authenticate'); // JWT authentication middleware

// Fetch all forms for a user
router.get('/', authenticate, async (req, res) => {
    try {
        const forms = await Form.findAll({
            where: { user_id: req.user.id }, // Forms belonging to the logged-in user
            include: [
                {
                    model: Template, // Include associated templates
                    attributes: ['title', 'description'], // Fetch template title and description
                },
            ],
        });
        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Fetch a specific form by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [
                {
                    model: Template,
                    attributes: ['title', 'description'],
                },
            ],
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        res.json(form);
    } catch (err) {
        console.error('Error fetching form:', err);
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

// Create a new form (fill out a template)
router.post('/', authenticate, async (req, res) => {
    try {
        const { template_id, answers } = req.body;

        // Ensure the template exists
        const template = await Template.findByPk(template_id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Create the form
        const form = await Form.create({
            user_id: req.user.id, // The logged-in user
            template_id,
            ...answers, // Spread the answers into the form model
        });

        res.status(201).json(form);
    } catch (err) {
        console.error('Error creating form:', err);
        res.status(500).json({ error: 'Failed to create form' });
    }
});

module.exports = router;