// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');

const authenticate = require('../middleware/authenticate');
const sequelize = require('../db');
const { Template, Form, TemplateTag, Tag, Comment, Like } = require('../models');

router.get('/search', async (req, res) => {
    const { query, tag } = req.query;

    console.log('Query Params:', { query, tag });

    try {
        let whereClause = {};
        let includeClause = [];

        // Add query-based search for title/description
        if (query) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } },
                ],
            };
        }

        // Add tag-based search
        if (tag) {
            includeClause.push({
                model: Tag,
                where: { id: tag }, // Search for templates with the given tag ID
                through: { attributes: [] }, // Exclude join table attributes
            });
        }

        // Fetch templates based on query and tag
        const templates = await Template.findAll({
            where: whereClause,
            include: includeClause,
        });

        console.log('Templates Fetched:', templates);
        res.json(templates);
    } catch (err) {
        console.error('Error searching templates:', err.message);
        res.status(500).json({ error: 'Failed to search templates' });
    }
});

/**
 * GET /api/templates/latest
 * - No auth required, fetches the latest templates
 */
router.get('/latest', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            order: [['createdAt', 'DESC']], // Order by creation date
            limit: 6, // Limit the number of results
            subQuery: false,
            include: [
                {
                    model: Like,
                    attributes: [], // No need to include individual likes
                },
                {
                    model: Tag,
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'image_url',
                'user_id',
                [
                    sequelize.fn('COUNT', sequelize.col('Likes.id')),
                    'likeCount', // Aggregate likes for each template
                ],
            ],
            group: ['Template.id', 'Tags.id'], // Group by template ID and tag ID
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching public templates:', err.message);
        res.status(500).json({ error: 'Failed to fetch public templates' });
    }
});

/**
 * GET /api/templates/top - Fetch top 5 most popular public templates
 */
router.get('/top', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            include: [
                {
                    model: Form,
                    attributes: [], // Exclude raw Form data
                },
                {
                    model: Like,
                    attributes: [], // Exclude raw Like data
                },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'image_url',
                'user_id',
                [sequelize.fn('COUNT', sequelize.col('Forms.id')), 'forms_count'], // Count forms
                [sequelize.fn('COUNT', sequelize.col('Likes.id')), 'likeCount'], // Count likes
            ],
            group: ['Template.id'], // Group by template ID
            order: [[sequelize.literal('forms_count'), 'DESC']], // Order by forms count
            limit: 5, // Limit the number of results
            subQuery: false,
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching top templates:', err.message);
        res.status(500).json({ error: 'Failed to fetch top templates' });
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
            include: [
                {
                    model: Like,
                    attributes: [], // No need to include individual likes
                },
                {
                    model: Tag,
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'image_url',
                'user_id',
                [
                    sequelize.fn('COUNT', sequelize.col('Likes.id')),
                    'likeCount', // Aggregate likes for each template
                ],
            ],
            group: ['Template.id', 'Tags.id'], // Group by template ID and tag ID
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching public templates:', err.message);
        res.status(500).json({ error: 'Failed to fetch public templates' });
    }
});

/**
 * GET /api/templates/:id
 * Fetch template by ID including tags, comments, and likes
 */
router.get('/:id', async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id, {
            include: [
                {
                    model: Tag,
                    through: { attributes: [] },
                    attributes: ['id', 'name'],
                },
                {
                    model: Comment,
                    attributes: ['id', 'user_id', 'content', 'createdAt'],
                },
                {
                    model: Like,
                    attributes: ['id', 'user_id'],
                },
            ],
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check if the template is public, owned by the user, or user is admin
        if (
            template.access_type !== 'public' &&
            req.user?.id !== template.user_id &&
            req.user?.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Count likes
        const likeCount = template.Likes?.length || 0;

        res.json({
            ...template.toJSON(),
            likeCount,
        });
    } catch (err) {
        console.error('Error fetching template:', err.message);
        res.status(500).json({ error: 'Failed to fetch template' });
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
            image_url,
            tags = [],
            // We'll receive these arrays from the frontend
            stringQuestions = [],
            multilineQuestions = [],
            intQuestions = [],
            checkboxQuestions = [],
        } = req.body;

        if (!title || !topic_id) {
            return res.status(400).json({ error: 'Title and topic are required' });
        }

        // Map string topic to numeric ID
        const topicMapping = {
            Education: 1,
            Quiz: 2,
            Other: 3,
        };
        const mappedTopicId = topicMapping[topic_id] || 3;

        // Create the new template
        const template = await Template.create({
            title,
            description: description || null,
            user_id: req.user.id,
            access_type: access_type || 'public',
            topic_id: mappedTopicId,
            image_url: image_url || null,

            // Single-line
            custom_string1_question: stringQuestions[0] || '',
            custom_string2_question: stringQuestions[1] || '',
            custom_string3_question: stringQuestions[2] || '',
            custom_string4_question: stringQuestions[3] || '',
            custom_string1_state: !!stringQuestions[0],
            custom_string2_state: !!stringQuestions[1],
            custom_string3_state: !!stringQuestions[2],
            custom_string4_state: !!stringQuestions[3],

            // Multi-line
            custom_multiline1_question: multilineQuestions[0] || '',
            custom_multiline2_question: multilineQuestions[1] || '',
            custom_multiline3_question: multilineQuestions[2] || '',
            custom_multiline4_question: multilineQuestions[3] || '',
            custom_multiline1_state: !!multilineQuestions[0],
            custom_multiline2_state: !!multilineQuestions[1],
            custom_multiline3_state: !!multilineQuestions[2],
            custom_multiline4_state: !!multilineQuestions[3],

            // Integer
            custom_int1_question: intQuestions[0] || '',
            custom_int2_question: intQuestions[1] || '',
            custom_int3_question: intQuestions[2] || '',
            custom_int4_question: intQuestions[3] || '',
            custom_int1_state: !!intQuestions[0],
            custom_int2_state: !!intQuestions[1],
            custom_int3_state: !!intQuestions[2],
            custom_int4_state: !!intQuestions[3],

            // Checkboxes
            custom_checkbox1_question: checkboxQuestions[0] || '',
            custom_checkbox2_question: checkboxQuestions[1] || '',
            custom_checkbox3_question: checkboxQuestions[2] || '',
            custom_checkbox4_question: checkboxQuestions[3] || '',
            custom_checkbox1_state: !!checkboxQuestions[0],
            custom_checkbox2_state: !!checkboxQuestions[1],
            custom_checkbox3_state: !!checkboxQuestions[2],
            custom_checkbox4_state: !!checkboxQuestions[3],
        });

        // Create/find tags and associate them
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
                await TemplateTag.create({ template_id: template.id, tag_id: tag.id });
            }
        }

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
 * PUT /api/templates/:id
 * - Auth required: only admin or owner
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            access_type,
            topic_id,
            image_url,
            tags = [],
            stringQuestions = [],
            multilineQuestions = [],
            intQuestions = [],
            checkboxQuestions = [],
        } = req.body;

        // Find existing template
        const template = await Template.findByPk(id, {
            include: [Tag],
        });
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check ownership or admin
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update' });
        }

        // Map topic again
        const topicMapping = {
            Education: 1,
            Quiz: 2,
            Other: 3,
        };
        const mappedTopicId = topicMapping[topic_id] || 3;

        // Use Template.update(...) in a single call:
        await Template.update(
            {
                title: title || template.title,
                description: description ?? null,
                access_type: access_type || 'public',
                topic_id: mappedTopicId,
                image_url: image_url || null,

                // Single-line
                custom_string1_question: stringQuestions[0] || '',
                custom_string2_question: stringQuestions[1] || '',
                custom_string3_question: stringQuestions[2] || '',
                custom_string4_question: stringQuestions[3] || '',
                custom_string1_state: !!stringQuestions[0],
                custom_string2_state: !!stringQuestions[1],
                custom_string3_state: !!stringQuestions[2],
                custom_string4_state: !!stringQuestions[3],

                // Multi-line
                custom_multiline1_question: multilineQuestions[0] || '',
                custom_multiline2_question: multilineQuestions[1] || '',
                custom_multiline3_question: multilineQuestions[2] || '',
                custom_multiline4_question: multilineQuestions[3] || '',
                custom_multiline1_state: !!multilineQuestions[0],
                custom_multiline2_state: !!multilineQuestions[1],
                custom_multiline3_state: !!multilineQuestions[2],
                custom_multiline4_state: !!multilineQuestions[3],

                // "Integer" (text)
                custom_int1_question: intQuestions[0] || '',
                custom_int2_question: intQuestions[1] || '',
                custom_int3_question: intQuestions[2] || '',
                custom_int4_question: intQuestions[3] || '',
                custom_int1_state: !!intQuestions[0],
                custom_int2_state: !!intQuestions[1],
                custom_int3_state: !!intQuestions[2],
                custom_int4_state: !!intQuestions[3],

                // Checkboxes
                custom_checkbox1_question: checkboxQuestions[0] || '',
                custom_checkbox2_question: checkboxQuestions[1] || '',
                custom_checkbox3_question: checkboxQuestions[2] || '',
                custom_checkbox4_question: checkboxQuestions[3] || '',
                custom_checkbox1_state: !!checkboxQuestions[0],
                custom_checkbox2_state: !!checkboxQuestions[1],
                custom_checkbox3_state: !!checkboxQuestions[2],
                custom_checkbox4_state: !!checkboxQuestions[3],
            },
            {
                where: { id },
            }
        );

        // We should re-fetch the updated template from the DB
        const updatedTemplate = await Template.findByPk(id, {
            include: [Tag],
        });

        // Update tags if provided
        if (tags && Array.isArray(tags)) {
            const tagInstances = [];
            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
                tagInstances.push(tag);
            }
            // Re-set template tags
            await updatedTemplate.setTags(tagInstances);
        }

        // Reload the template with tags after updating
        await updatedTemplate.reload({
            include: [Tag],
        });

        return res.json({
            message: 'Template updated successfully',
            template: updatedTemplate,
        });
    } catch (err) {
        console.error('Error updating template:', err.message);
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