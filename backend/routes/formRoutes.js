const express = require('express');
const router = express.Router();
const Form = require('../models/Form'); // Sequelize Form model
const authenticate = require('../middleware/authenticate'); // Middleware for JWT auth

// Submit a new form
router.post('/', authenticate, async (req, res) => {
    try {
        const form = await Form.create({
            ...req.body,
            user_id: req.user.id, // Attach the user ID from JWT
        });
        res.status(201).json(form);
    } catch (err) {
        console.error('Error creating form:', err);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

// Get all forms for a template
router.get('/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        const forms = await Form.findAll({ where: { template_id: templateId } });
        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Get details for a specific form
router.get('/details/:formId', authenticate, async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await Form.findByPk(formId);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.json(form);
    } catch (err) {
        console.error('Error fetching form details:', err);
        res.status(500).json({ error: 'Failed to fetch form details' });
    }
});

module.exports = router;