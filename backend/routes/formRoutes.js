// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Form = require('../models/Form');
const Template = require('../models/Template');
const { User } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * GET /api/forms
 * Fetch all forms
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const user = req.user;
        let forms;

        if (user.role === 'admin') {
            // Admin sees all forms
            forms = await Form.findAll({
                include: [
                    { model: Template, attributes: ['id', 'title'] },
                    { model: User, attributes: ['id', 'username'] },
                ],
            });
        } else {
            // Users only see forms from their templates
            const userTemplates = await Template.findAll({ where: { user_id: user.id } });
            const templateIds = userTemplates.map((template) => template.id);

            forms = await Form.findAll({
                where: { template_id: templateIds },
                include: [
                    { model: Template, attributes: ['id', 'title'] },
                    { model: User, attributes: ['id', 'username'] },
                ],
            });
        }

        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

/**
 * GET /api/forms/:id
 * Fetch details of a specific form
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [
                { model: Template },
                { model: User, attributes: ['username'] },
            ],
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        res.json(form);
    } catch (err) {
        console.error('Error fetching form details:', err);
        res.status(500).json({ error: 'Failed to fetch form details' });
    }
});

/**
 * POST /api/forms/:templateId/submit
 * - Auth required: submit a new form for a given template
 */
router.post('/:templateId/submit', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // If the template is private, only owner or admin can fill (adjust if you want others)
        if (
            template.access_type !== 'public' &&
            template.user_id !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Access denied: Template is private' });
        }

        // Destructure answers from req.body
        const {
            custom_string1_answer,
            custom_string2_answer,
            custom_string3_answer,
            custom_string4_answer,
            custom_multiline1_answer,
            custom_multiline2_answer,
            custom_multiline3_answer,
            custom_multiline4_answer,
            custom_int1_answer,
            custom_int2_answer,
            custom_int3_answer,
            custom_int4_answer,
            custom_checkbox1_answer = false,
            custom_checkbox2_answer = false,
            custom_checkbox3_answer = false,
            custom_checkbox4_answer = false,
        } = req.body;

        // Basic validation if needed (only if the template state is set)
        // e.g. if (template.custom_string1_state && !custom_string1_answer)...

        const form = await Form.create({
            template_id: templateId,
            user_id: req.user.id,

            custom_string1_answer: custom_string1_answer || null,
            custom_string2_answer: custom_string2_answer || null,
            custom_string3_answer: custom_string3_answer || null,
            custom_string4_answer: custom_string4_answer || null,

            custom_multiline1_answer: custom_multiline1_answer || null,
            custom_multiline2_answer: custom_multiline2_answer || null,
            custom_multiline3_answer: custom_multiline3_answer || null,
            custom_multiline4_answer: custom_multiline4_answer || null,

            custom_int1_answer: custom_int1_answer || null,
            custom_int2_answer: custom_int2_answer || null,
            custom_int3_answer: custom_int3_answer || null,
            custom_int4_answer: custom_int4_answer || null,

            custom_checkbox1_answer,
            custom_checkbox2_answer,
            custom_checkbox3_answer,
            custom_checkbox4_answer,
        });

        res.status(201).json({ message: 'Form submitted successfully', form });
    } catch (err) {
        console.error('Error submitting form:', err);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

/**
 * GET /api/forms/template/:templateId
 * - Auth required: get all forms for a specific template (admin or template owner only)
 */
router.get('/template/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        // Fetch the template
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check if the user has access
        if (
            req.user.role !== 'admin' &&
            req.user.id !== template.user_id &&
            template.access_type !== 'public'
        ) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Fetch forms associated with the template
        const forms = await Form.findAll({ where: { template_id: templateId } });

        // Check if the user is the owner of any forms (if needed)
        const filteredForms = forms.filter(
            (form) => req.user.role === 'admin' || form.user_id === req.user.id || req.user.id === template.user_id
        );

        res.json(filteredForms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

/**
 * PUT /api/forms/:id
 * - Auth required: only admin or template owner
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findByPk(id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const template = await Template.findByPk(form.template_id);
        if (req.user.role !== 'admin' && req.user.id !== template.user_id) {
            return res.status(403).json({ error: 'Unauthorized to edit this form' });
        }

        await form.update(req.body);
        res.json({ message: 'Form updated successfully', form });
    } catch (err) {
        console.error('Error updating form:', err);
        res.status(500).json({ error: 'Failed to update form' });
    }
});

/**
 * DELETE /api/forms/:id
 * - Auth required: only admin or template owner
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findByPk(id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const template = await Template.findByPk(form.template_id);
        if (req.user.role !== 'admin' && req.user.id !== template.user_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this form' });
        }

        await form.destroy();
        res.json({ message: 'Form deleted successfully' });
    } catch (err) {
        console.error('Error deleting form:', err);
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

module.exports = router;