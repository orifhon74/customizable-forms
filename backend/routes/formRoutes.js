const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const authenticate = require('../middleware/authenticate'); // JWT authentication middleware
const Template = require('../models/Template');
const User = require('../models/User');

// Get all forms for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const forms = await Form.findAll({
            where: { user_id: req.user.id }, // Fetch forms for the logged-in user
            include: [
                {
                    model: Template,
                    attributes: ['title', 'description'], // Include related template details
                },
                {
                    model: User,
                    attributes: ['username', 'email'], // Include related user details
                },
            ],
        });

        if (!forms || forms.length === 0) {
            return res.status(404).json({ error: 'No forms available' });
        }

        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Get a single form by ID
router.get('/:formId', authenticate, async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await Form.findByPk(formId, {
            include: [
                {
                    model: Template,
                    attributes: ['title', 'description'],
                },
                {
                    model: User,
                    attributes: ['username', 'email'],
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

// Create a new form
router.post('/', authenticate, async (req, res) => {
    try {
        const { template_id, ...answers } = req.body;

        const form = await Form.create({
            template_id,
            user_id: req.user.id, // Use the authenticated user's ID
            ...answers, // Dynamically add answers
        });

        res.status(201).json(form);
    } catch (err) {
        console.error('Error creating form:', err);
        res.status(500).json({ error: 'Failed to create form' });
    }
});

module.exports = router;