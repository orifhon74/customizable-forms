// templateRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Template = require('../models/Template');
const Form = require('../models/Form');
const authenticate = require('../middleware/authenticate');

// Utility to check if user can access a private template
async function canAccessTemplate(template, user) {
    // If public
    if (template.access_type === 'public') return true;

    // If admin or owner
    if (user.role === 'admin' || template.user_id === user.id) return true;

    // If in allowed_users (if using JSON array)
    if (template.allowed_users && Array.isArray(template.allowed_users)) {
        if (template.allowed_users.includes(user.id)) return true;
    }
    return false;
}

/**
 * GET /api/templates/public
 * Returns all public templates
 */
router.get('/public', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            order: [['createdAt', 'DESC']],
        });
        res.json(templates);
    } catch (err) {
        console.error('Error fetching public templates:', err);
        res.status(500).json({ error: 'Failed to fetch public templates' });
    }
});

/**
 * GET /api/templates
 * Auth required. If admin => all templates, else => user-owned + public
 */
router.get('/', authenticate, async (req, res) => {
    try {
        let templates;
        if (req.user.role === 'admin') {
            templates = await Template.findAll({ order: [['createdAt', 'DESC']] });
        } else {
            // public OR user is owner
            templates = await Template.findAll({
                where: {
                    [Op.or]: [
                        { access_type: 'public' },
                        { user_id: req.user.id },
                        // or check allowed_users if using that approach
                    ],
                },
                order: [['createdAt', 'DESC']],
            });
        }
        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

/**
 * POST /api/templates
 * Auth required: create a new template.
 * Using "topic" as a string (Education, Quiz, Other).
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title,
            description,
            image_url,
            topic,  // string
            access_type = 'public',
            allowed_users = [],
            tags = [],
            // question arrays
            stringQuestions = [],
            multilineQuestions = [],
            intQuestions = [],
            checkboxQuestions = [],
        } = req.body;

        if (!title || !topic) {
            return res.status(400).json({ error: 'Title and topic are required' });
        }

        // Create template
        const template = await Template.create({
            title,
            description: description || null,
            image_url: image_url || null,
            user_id: req.user.id,
            topic,
            access_type,
            allowed_users: allowed_users.length ? allowed_users : null,

            // single-line questions
            custom_string1_state: !!stringQuestions[0],
            custom_string1_question: stringQuestions[0] || null,
            custom_string2_state: !!stringQuestions[1],
            custom_string2_question: stringQuestions[1] || null,
            custom_string3_state: !!stringQuestions[2],
            custom_string3_question: stringQuestions[2] || null,
            custom_string4_state: !!stringQuestions[3],
            custom_string4_question: stringQuestions[3] || null,

            // multiline
            custom_multiline1_state: !!multilineQuestions[0],
            custom_multiline1_question: multilineQuestions[0] || null,
            custom_multiline2_state: !!multilineQuestions[1],
            custom_multiline2_question: multilineQuestions[1] || null,
            custom_multiline3_state: !!multilineQuestions[2],
            custom_multiline3_question: multilineQuestions[2] || null,
            custom_multiline4_state: !!multilineQuestions[3],
            custom_multiline4_question: multilineQuestions[3] || null,

            // integer
            custom_int1_state: !!intQuestions[0],
            custom_int1_question: intQuestions[0] || null,
            custom_int2_state: !!intQuestions[1],
            custom_int2_question: intQuestions[1] || null,
            custom_int3_state: !!intQuestions[2],
            custom_int3_question: intQuestions[2] || null,
            custom_int4_state: !!intQuestions[3],
            custom_int4_question: intQuestions[3] || null,

            // checkbox
            custom_checkbox1_state: !!checkboxQuestions[0],
            custom_checkbox1_question: checkboxQuestions[0] || null,
            custom_checkbox2_state: !!checkboxQuestions[1],
            custom_checkbox2_question: checkboxQuestions[1] || null,
            custom_checkbox3_state: !!checkboxQuestions[2],
            custom_checkbox3_question: checkboxQuestions[2] || null,
            custom_checkbox4_state: !!checkboxQuestions[3],
            custom_checkbox4_question: checkboxQuestions[3] || null,
        });

        res.status(201).json({ message: 'Template created', template });
    } catch (err) {
        console.error('Error creating template:', err);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

/**
 * GET /api/templates/:id
 * Auth required. Must be public or user is owner/admin or in allowed_users.
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const canAccess = await canAccessTemplate(template, req.user);
        if (!canAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(template);
    } catch (err) {
        console.error('Error fetching template:', err);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

/**
 * PUT /api/templates/:id
 * Auth required. Only admin or owner can update.
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (req.user.role !== 'admin' && req.user.id !== template.user_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await template.update(req.body);
        res.json({ message: 'Template updated', template });
    } catch (err) {
        console.error('Error updating template:', err);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

/**
 * DELETE /api/templates/:id
 * Auth required. Only admin or owner can delete.
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (req.user.role !== 'admin' && req.user.id !== template.user_id) {
            return res.status(403).json({ error: 'Unauthorized to delete' });
        }
        await template.destroy();
        res.json({ message: 'Template deleted' });
    } catch (err) {
        console.error('Error deleting template:', err);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

/**
 * GET /api/templates/:id/forms
 * Auth required. Only admin or owner can see forms.
 */
router.get('/:id/forms', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        // check if user is admin or owner or in allowed users
        const canAccess = await canAccessTemplate(template, req.user);
        if (!canAccess) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const forms = await Form.findAll({ where: { template_id: template.id } });
        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

module.exports = router;