const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const authenticate = require('../middleware/authenticate');
const { Op } = require('sequelize');

// Fetch all public templates
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

// Fetch all templates (Authenticated User or Admin)
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
        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

router.get('/', async (req, res) => {
    const { search } = req.query;

    try {
        const whereClause = search
            ? { [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ]}
            : {};

        const templates = await Template.findAll({ where: whereClause });
        res.json(templates);
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});


// Create a new template
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title,
            description,
            access_type,
            topic_id,
            stringQuestions,
            multilineQuestions,
            intQuestions,
            checkboxQuestions,
        } = req.body;

        // Validate required fields
        if (!title || !topic_id) {
            return res.status(400).json({ error: 'Title and topic are required' });
        }

        const template = await Template.create({
            title,
            description: description || null,
            user_id: req.user.id,
            access_type,
            topic_id, // Save topic_id to the database
            custom_string1_state: !!stringQuestions[0],
            custom_string1_question: stringQuestions[0] || null,
            custom_string2_state: !!stringQuestions[1],
            custom_string2_question: stringQuestions[1] || null,
            custom_string3_state: !!stringQuestions[2],
            custom_string3_question: stringQuestions[2] || null,
            custom_string4_state: !!stringQuestions[3],
            custom_string4_question: stringQuestions[3] || null,
            custom_multiline1_state: !!multilineQuestions[0],
            custom_multiline1_question: multilineQuestions[0] || null,
            custom_multiline2_state: !!multilineQuestions[1],
            custom_multiline2_question: multilineQuestions[1] || null,
            custom_multiline3_state: !!multilineQuestions[2],
            custom_multiline3_question: multilineQuestions[2] || null,
            custom_multiline4_state: !!multilineQuestions[3],
            custom_multiline4_question: multilineQuestions[3] || null,
            custom_int1_state: !!intQuestions[0],
            custom_int1_question: intQuestions[0] || null,
            custom_int2_state: !!intQuestions[1],
            custom_int2_question: intQuestions[1] || null,
            custom_int3_state: !!intQuestions[2],
            custom_int3_question: intQuestions[2] || null,
            custom_int4_state: !!intQuestions[3],
            custom_int4_question: intQuestions[3] || null,
            custom_checkbox1_state: !!checkboxQuestions[0],
            custom_checkbox1_question: checkboxQuestions[0] || null,
            custom_checkbox2_state: !!checkboxQuestions[1],
            custom_checkbox2_question: checkboxQuestions[1] || null,
            custom_checkbox3_state: !!checkboxQuestions[2],
            custom_checkbox3_question: checkboxQuestions[2] || null,
            custom_checkbox4_state: !!checkboxQuestions[3],
            custom_checkbox4_question: checkboxQuestions[3] || null,
        });

        res.status(201).json({ message: 'Template created successfully', template });
    } catch (err) {
        console.error('Error creating template:', err.message, err.stack);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Get a single template by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Only allow access if the template is public, belongs to the user, or the user is an admin
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

// Example for template update
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const template = await Template.findByPk(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Allow admins to update any template
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

module.exports = router;