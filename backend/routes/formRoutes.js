const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Template = require('../models/Template');
const authenticate = require('../middleware/authenticate');
const {User} = require("../models");

// Submit a new form
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            template_id,
            string1_answer,
            int1_answer,
            checkbox1_answer,
        } = req.body;

        // Check if template exists
        const template = await Template.findByPk(template_id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const form = await Form.create({
            template_id,
            user_id: req.user.id,
            string1_answer,
            int1_answer,
            checkbox1_answer,
        });

        res.status(201).json(form);
    } catch (err) {
        console.error('Error submitting form:', err);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

// Fetch all forms (specific to user)
router.get('/', authenticate, async (req, res) => {
    try {
        const forms = await Form.findAll({
            where: { user_id: req.user.id },
            include: [
                { model: Template, attributes: ['id', 'title'] },
                { model: User, attributes: ['id', 'username', 'email'] },
            ],
        });
        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Get a specific form
router.get('/:id', authenticate, async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [{ model: Template, as: 'Template' }],
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Only allow access if the user owns the form or is an admin
        if (form.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(form);
    } catch (err) {
        console.error('Error fetching form:', err);
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

module.exports = router;