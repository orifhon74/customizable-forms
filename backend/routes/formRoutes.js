    const express = require('express');
    const router = express.Router();
    const Form = require('../models/Form');
    const Template = require('../models/Template');
    const authenticate = require('../middleware/authenticate');
    const {User} = require("../models");

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

    // Submit a form (answers to a template)
    // Validate form data based on template structure
    router.post('/:templateId/submit', authenticate, async (req, res) => {
        try {
            const { templateId } = req.params;
            const template = await Template.findByPk(templateId);

            if (!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            const {
                string1_answer,
                int1_answer,
                checkbox1_answer,
            } = req.body;

            // Validate answers based on template structure
            if (template.custom_string1_state && !string1_answer) {
                return res.status(400).json({ error: 'Missing required string1_answer' });
            }
            if (template.custom_int1_state && (isNaN(int1_answer) || int1_answer === null)) {
                return res.status(400).json({ error: 'Invalid or missing int1_answer' });
            }
            if (template.custom_checkbox1_state && typeof checkbox1_answer !== 'boolean') {
                return res.status(400).json({ error: 'Invalid checkbox1_answer' });
            }

            const form = await Form.create({
                template_id: templateId,
                user_id: req.user.id,
                string1_answer: string1_answer || null,
                int1_answer: int1_answer || null,
                checkbox1_answer: checkbox1_answer || null,
            });

            res.status(201).json({ message: 'Form submitted successfully', form });
        } catch (err) {
            console.error('Error submitting form:', err);
            res.status(500).json({ error: 'Failed to submit form', details: err.message });
        }
    });

    module.exports = router;