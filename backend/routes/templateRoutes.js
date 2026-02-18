// routes/templateRoutes.js

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const authenticate = require('../middleware/authenticate');
const sequelize = require('../db');
const authenticateOptional = require('../middleware/authenticateOptional');

// Import your models
const {
    Template,
    Form,
    TemplateTag,
    Tag,
    Comment,
    Like,
    User,
    Question,
} = require('../models');

const topicMapping = {
    Other: 1,
    Quiz: 2,
    Feedback: 3,
    Education: 4,
    Survey: 5,
    Job: 6,
    Health: 7,
    Research: 8,
    Finance: 9,
    Entertainment: 10,
};

function mapTopicId(topic_id) {
    // If already a number, use it directly (common if frontend sends numeric)
    if (typeof topic_id === 'number') return topic_id;
    if (typeof topic_id === 'string' && /^\d+$/.test(topic_id)) return Number(topic_id);

    // Otherwise map from string topic name
    return topicMapping[topic_id] || 1;
}

/**
 * -----------------------------------
 * GET /api/templates/search
 * -----------------------------------
 * Privacy fix:
 * - Guests: only public templates
 * - Logged-in users: public + their own templates
 * - Admin: everything
 */
router.get('/search', authenticateOptional, async (req, res) => {
    const { query, tag } = req.query;

    try {
        const whereClause = {};
        const includeClause = [];

        // Access control
        if (!req.user) {
            whereClause.access_type = 'public';
        } else if (req.user.role !== 'admin') {
            whereClause[Op.or] = [{ access_type: 'public' }, { user_id: req.user.id }];
        }

        // Query-based search for title or description
        if (query) {
            whereClause[Op.and] = whereClause[Op.and] || [];
            whereClause[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } },
                ],
            });
        }

        // Tag-based search (NOTE: currently expects tag = Tag.id)
        if (tag) {
            includeClause.push({
                model: Tag,
                where: { id: tag },
                through: { attributes: [] },
            });
        }

        const templates = await Template.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']],
        });

        res.json(templates);
    } catch (err) {
        console.error('Error searching templates:', err.message);
        res.status(500).json({ error: 'Failed to search templates' });
    }
});

/**
 * -----------------------------------
 * GET /api/templates/latest
 * -----------------------------------
 * - No auth required, fetches the latest 6 public templates
 */
router.get('/latest', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            order: [['createdAt', 'DESC']],
            limit: 6,
            subQuery: false,
            include: [
                { model: Like, attributes: [] },
                { model: Tag, attributes: ['id', 'name'], through: { attributes: [] } },
                { model: User, attributes: ['id', 'username'] },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'image_url',
                'user_id',
                'allow_form_editing',
                [sequelize.fn('COUNT', sequelize.col('Likes.id')), 'likeCount'],
            ],
            group: ['Template.id', 'Tags.id', 'User.id'],
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching public templates:', err.message);
        res.status(500).json({ error: 'Failed to fetch public templates' });
    }
});

/**
 * -----------------------------------
 * GET /api/templates/top
 * -----------------------------------
 * - Fetch top 5 most popular public templates
 */
router.get('/top', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            include: [
                { model: Form, attributes: [] },
                { model: Like, attributes: [] },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'image_url',
                'user_id',
                'allow_form_editing',
                [sequelize.fn('COUNT', sequelize.col('Forms.id')), 'forms_count'],
                [sequelize.fn('COUNT', sequelize.col('Likes.id')), 'likeCount'],
            ],
            group: ['Template.id'],
            order: [[sequelize.literal('forms_count'), 'DESC']],
            limit: 5,
            subQuery: false,
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching top templates:', err.message);
        res.status(500).json({ error: 'Failed to fetch top templates' });
    }
});

/**
 * -----------------------------------
 * GET /api/templates/public
 * -----------------------------------
 * - Returns all public templates
 */
router.get('/public', async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: 'public' },
            include: [
                { model: Like, attributes: [] },
                { model: Tag, attributes: ['id', 'name'], through: { attributes: [] } },
                { model: User, attributes: ['id', 'username'] },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'image_url',
                'user_id',
                'allow_form_editing',
                [sequelize.fn('COUNT', sequelize.col('Likes.id')), 'likeCount'],
            ],
            group: ['Template.id', 'Tags.id', 'User.id'],
        });

        res.json(templates);
    } catch (err) {
        console.error('Error fetching public templates:', err.message);
        res.status(500).json({ error: 'Failed to fetch public templates' });
    }
});

/**
 * -----------------------------------
 * GET /api/templates/:id
 * -----------------------------------
 * - Fetch one template (plus tags, comments, likes, questions)
 */
router.get('/:id', authenticateOptional, async (req, res) => {
    try {
        const templateId = req.params.id;

        const template = await Template.findByPk(templateId, {
            include: [
                { model: Tag, through: { attributes: [] }, attributes: ['id', 'name'] },
                { model: Comment, attributes: ['id', 'user_id', 'content', 'createdAt'] },
                { model: Like, attributes: ['id', 'user_id'] },
                { model: Question, attributes: ['id', 'question_text', 'question_type'] },
            ],
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // If template is private, only the owner or admin can see it
        if (
            template.access_type !== 'public' &&
            req.user?.id !== template.user_id &&
            req.user?.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Count likes
        const likeCount = template.Likes?.length || 0;

        // Convert to JSON and add likeCount
        const data = template.toJSON();
        data.likeCount = likeCount;

        res.json(data);
    } catch (err) {
        console.error('Error fetching template:', err.message);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

/**
 * -----------------------------------
 * GET /api/templates
 * Auth required
 * -----------------------------------
 * - If admin, get all
 * - Otherwise, get user-owned + public
 */
router.get('/', authenticate, async (req, res) => {
    try {
        let templates;
        if (req.user.role === 'admin') {
            templates = await Template.findAll();
        } else {
            templates = await Template.findAll({
                where: {
                    [Op.or]: [{ access_type: 'public' }, { user_id: req.user.id }],
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
 * -----------------------------------
 * POST /api/templates
 * Auth required
 * -----------------------------------
 * - Create a template
 * - Create questions array
 * - Associate tags
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
            questions = [],
            allow_form_editing, // NEW
        } = req.body;

        if (!title || !topic_id) {
            return res.status(400).json({ error: 'Title and topic are required' });
        }

        const mappedTopicId = mapTopicId(topic_id);

        // 1) Create the template
        const template = await Template.create({
            title,
            description: description || null,
            user_id: req.user.id,
            access_type: access_type || 'public',
            topic_id: mappedTopicId,
            image_url: image_url || null,
            allow_form_editing: Boolean(allow_form_editing), // NEW
        });

        // 2) Create questions
        if (Array.isArray(questions)) {
            for (const q of questions) {
                await Question.create({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    template_id: template.id,
                });
            }
        }

        // 3) Tags
        if (Array.isArray(tags)) {
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
 * -----------------------------------
 * PUT /api/templates/:id
 * Auth required
 * -----------------------------------
 * - Update template fields
 * - Replace questions
 * - Update tags
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
            questions = [],
            allow_form_editing, // NEW
        } = req.body;

        const template = await Template.findByPk(id, { include: [Tag] });
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Ownership or admin check
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update' });
        }

        const mappedTopicId = topic_id !== undefined ? mapTopicId(topic_id) : template.topic_id;

        // 1) Update the template fields
        await template.update({
            title: title ?? template.title,
            description: description ?? template.description,
            access_type: access_type ?? template.access_type,
            topic_id: mappedTopicId,
            image_url: image_url ?? template.image_url,
            // Only update if explicitly provided, otherwise preserve existing
            ...(allow_form_editing !== undefined ? { allow_form_editing: Boolean(allow_form_editing) } : {}),
        });

        // 2) Replace questions
        await Question.destroy({ where: { template_id: template.id } });

        if (Array.isArray(questions)) {
            for (const q of questions) {
                await Question.create({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    template_id: template.id,
                });
            }
        }

        // 3) Update tags
        if (Array.isArray(tags)) {
            const tagInstances = [];
            for (const tagName of tags) {
                const [tg] = await Tag.findOrCreate({ where: { name: tagName } });
                tagInstances.push(tg);
            }
            await template.setTags(tagInstances);
        }

        // 4) Reload updated template
        const updatedTemplate = await Template.findByPk(id, { include: [Tag] });
        return res.json({
            message: 'Template updated successfully',
            template: updatedTemplate,
        });
    } catch (err) {
        console.error('Error updating template:', err);
        return res.status(500).json({ error: 'Failed to update template' });
    }
});

/**
 * -----------------------------------
 * DELETE /api/templates/:id
 * Auth required: only admin or owner
 * -----------------------------------
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
 * -----------------------------------
 * GET /api/templates/:id/forms
 * Auth required: owner or admin
 * -----------------------------------
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