// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Template = require('../models/Template');
const Form = require('../models/Form');
const authenticate = require('../middleware/authenticate');

/**
 * GET /api/templates/search?search=...
 * - Public endpoint: search by title or description
 */
router.get('/search', async (req, res) => {
    const { search } = req.query;
    try {
        const whereClause = search
            ? {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ],
            }
            : {};

        const templates = await Template.findAll({ where: whereClause });
        return res.json(templates);
    } catch (err) {
        console.error('Error searching templates:', err);
        return res.status(500).json({ error: 'Failed to search templates' });
    }
});

/**
 * GET /api/templates/public
 * - No auth required, returns only access_type = 'public'
 */
router.get('/public', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            attributes: ['id', 'title', 'description', 'image_url', 'user_id'],
        });
        res.json(templates);
    } catch (err) {
        console.error('Error fetching public templates:', err);
        res.status(500).json({ error: 'Failed to fetch public templates' });
    }
});

/**
 * GET /api/templates
 * - Auth required: if admin => all templates, else => user-owned + public
 */
router.get('/', authenticate, async (req, res) => {
    try {
        let templates;
        if (req.user.role === 'admin') {
            templates = await Template.findAll();
        } else {
            templates = await Template.findAll({
                where: {
                    [Op.or]: [
                        { access_type: 'public' },
                        { user_id: req.user.id },
                    ],
                },
            });
        }
        return res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        return res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

/**
 * POST /api/templates
 * - Auth required: create a new template
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title,
            description,
            access_type,
            topic_id,
            stringQuestions = [],
            multilineQuestions = [],
            intQuestions = [],
            checkboxQuestions = [],
        } = req.body;

        if (!title || !topic_id) {
            return res.status(400).json({ error: 'Title and topic are required' });
        }

        const template = await Template.create({
            title,
            description: description || null,
            user_id: req.user.id,
            access_type: access_type || 'public',
            topic_id,

            // Single-line
            custom_string1_state: !!stringQuestions[0],
            custom_string1_question: stringQuestions[0] || null,
            custom_string2_state: !!stringQuestions[1],
            custom_string2_question: stringQuestions[1] || null,
            custom_string3_state: !!stringQuestions[2],
            custom_string3_question: stringQuestions[2] || null,
            custom_string4_state: !!stringQuestions[3],
            custom_string4_question: stringQuestions[3] || null,

            // Multi-line
            custom_multiline1_state: !!multilineQuestions[0],
            custom_multiline1_question: multilineQuestions[0] || null,
            custom_multiline2_state: !!multilineQuestions[1],
            custom_multiline2_question: multilineQuestions[1] || null,
            custom_multiline3_state: !!multilineQuestions[2],
            custom_multiline3_question: multilineQuestions[2] || null,
            custom_multiline4_state: !!multilineQuestions[3],
            custom_multiline4_question: multilineQuestions[3] || null,

            // Integer
            custom_int1_state: !!intQuestions[0],
            custom_int1_question: intQuestions[0] || null,
            custom_int2_state: !!intQuestions[1],
            custom_int2_question: intQuestions[1] || null,
            custom_int3_state: !!intQuestions[2],
            custom_int3_question: intQuestions[2] || null,
            custom_int4_state: !!intQuestions[3],
            custom_int4_question: intQuestions[3] || null,

            // Checkboxes
            custom_checkbox1_state: !!checkboxQuestions[0],
            custom_checkbox1_question: checkboxQuestions[0] || null,
            custom_checkbox2_state: !!checkboxQuestions[1],
            custom_checkbox2_question: checkboxQuestions[1] || null,
            custom_checkbox3_state: !!checkboxQuestions[2],
            custom_checkbox3_question: checkboxQuestions[2] || null,
            custom_checkbox4_state: !!checkboxQuestions[3],
            custom_checkbox4_question: checkboxQuestions[3] || null,
        });

        return res.status(201).json({
            message: 'Template created successfully',
            template,
        });
    } catch (err) {
        console.error('Error creating template:', err.message);
        return res.status(500).json({ error: 'Failed to create template' });
    }
});

/**
 * GET /api/templates/:id
 * - Auth required: must be public, or owner, or admin
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        if (
            template.access_type !== 'public' &&
            template.user_id !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Access denied' });
        }

        return res.json(template);
    } catch (err) {
        console.error('Error fetching template:', err);
        return res.status(500).json({ error: 'Failed to fetch template' });
    }
});

/**
 * PUT /api/templates/:id
 * - Auth required: only admin or owner
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const template = await Template.findByPk(id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update' });
        }

        await template.update(updates);
        return res.json({ message: 'Template updated successfully', template });
    } catch (err) {
        console.error('Error updating template:', err);
        return res.status(500).json({ error: 'Failed to update template' });
    }
});

/**
 * DELETE /api/templates/:id
 * - Auth required: only admin or owner
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findByPk(id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete' });
        }

        await template.destroy();
        return res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        console.error('Error deleting template:', err);
        return res.status(500).json({ error: 'Failed to delete template' });
    }
});

/**
 * GET /api/templates/:id/forms
 * - Auth required: only admin or owner
 */
router.get('/:id/forms', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const forms = await Form.findAll({ where: { template_id: template.id } });
        return res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        return res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

module.exports = router;