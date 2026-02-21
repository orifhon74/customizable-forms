// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const authenticate = require('../middleware/authenticate');
const sequelize = require('../db');
const authenticateOptional = require('../middleware/authenticateOptional');

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

// -----------------------------------
// GET /api/templates/search
// -----------------------------------
router.get('/search', authenticateOptional, async (req, res) => {
    const { query, tag } = req.query;

    try {
        const whereClause = {};
        const includeClause = [];

        if (!req.user) {
            whereClause.access_type = 'public';
        } else if (req.user.role !== 'admin') {
            whereClause[Op.or] = [{ access_type: 'public' }, { user_id: req.user.id }];
        }

        if (query) {
            whereClause[Op.and] = whereClause[Op.and] || [];
            whereClause[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } },
                ],
            });
        }

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

// -----------------------------------
// GET /api/templates/latest
// Returns latest PUBLIC templates (limit 6)
// likeCount is computed via subquery to avoid GROUP BY issues with Tags
// -----------------------------------
router.get("/latest", async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: "public" },
            order: [["createdAt", "DESC"]],
            limit: 6,
            subQuery: false,
            include: [
                { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
                { model: User, attributes: ["id", "username"] },
            ],
            attributes: [
                "id",
                "title",
                "description",
                "image_url",
                "user_id",
                "allow_editing",
                "createdAt",
                [
                    sequelize.literal(
                        `(SELECT COUNT(*) FROM Likes WHERE Likes.template_id = Template.id)`
                    ),
                    "likeCount",
                ],
            ],
        });

        res.json(templates);
    } catch (err) {
        console.error("Error fetching latest templates:", err.message);
        res.status(500).json({ error: "Failed to fetch latest templates" });
    }
});

// -----------------------------------
// GET /api/templates/top
// "Top" based on LIKE COUNT (primary), then forms submitted (secondary)
// Avoid join multiplication by using subquery counts.
// -----------------------------------
router.get("/top", async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { access_type: "public" },
            limit: 6,
            subQuery: false,
            include: [
                { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
                { model: User, attributes: ["id", "username"] },
            ],
            attributes: [
                "id",
                "title",
                "description",
                "image_url",
                "user_id",
                "allow_editing",
                "createdAt",
                [
                    sequelize.literal(
                        `(SELECT COUNT(*) FROM Likes WHERE Likes.template_id = Template.id)`
                    ),
                    "likeCount",
                ],
                [
                    sequelize.literal(
                        `(SELECT COUNT(*) FROM Forms WHERE Forms.template_id = Template.id)`
                    ),
                    "forms_count",
                ],
            ],
            order: [
                [sequelize.literal("likeCount"), "DESC"],
                [sequelize.literal("forms_count"), "DESC"],
                ["createdAt", "DESC"],
            ],
        });

        res.json(templates);
    } catch (err) {
        console.error("Error fetching top templates:", err.message);
        res.status(500).json({ error: "Failed to fetch top templates" });
    }
});

// -----------------------------------
// GET /api/templates/public
// -----------------------------------
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
                'allow_editing', // ✅ include
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

// -----------------------------------
// GET /api/templates/:id
// -----------------------------------
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

        if (!template) return res.status(404).json({ error: 'Template not found' });

        if (
            template.access_type !== 'public' &&
            req.user?.id !== template.user_id &&
            req.user?.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const likeCount = template.Likes?.length || 0;
        const data = template.toJSON();
        data.likeCount = likeCount;

        // ✅ ensure allow_editing is present in response
        if (data.allow_editing === undefined) data.allow_editing = template.allow_editing;

        res.json(data);
    } catch (err) {
        console.error('Error fetching template:', err.message);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// -----------------------------------
// GET /api/templates  (auth required)
// -----------------------------------
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

// -----------------------------------
// POST /api/templates
// -----------------------------------
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
            allow_editing = false, // ✅ NEW
        } = req.body;

        if (!title || !topic_id) {
            return res.status(400).json({ error: 'Title and topic are required' });
        }

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
        const mappedTopicId = topicMapping[topic_id] || 1;

        const template = await Template.create({
            title,
            description: description || null,
            user_id: req.user.id,
            access_type: access_type || 'public',
            topic_id: mappedTopicId,
            image_url: image_url || null,
            allow_editing: Boolean(allow_editing), // ✅ NEW
        });

        if (Array.isArray(questions)) {
            for (const q of questions) {
                await Question.create({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    template_id: template.id,
                });
            }
        }

        if (Array.isArray(tags)) {
            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
                await TemplateTag.create({ template_id: template.id, tag_id: tag.id });
            }
        }

        return res.status(201).json({ message: 'Template created successfully', template });
    } catch (err) {
        console.error('Error creating template:', err.message);
        return res.status(500).json({ error: 'Failed to create template' });
    }
});

// -----------------------------------
// PUT /api/templates/:id
// -----------------------------------
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
            allow_editing, // ✅ NEW
        } = req.body;

        const template = await Template.findByPk(id, { include: [Tag] });
        if (!template) return res.status(404).json({ error: 'Template not found' });

        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update' });
        }

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
        const mappedTopicId = topicMapping[topic_id] || 1;

        await template.update({
            title: title ?? template.title,
            description: description ?? template.description,
            access_type: access_type ?? template.access_type,
            topic_id: mappedTopicId,
            image_url: image_url ?? template.image_url,
            // ✅ only update if provided, else keep existing
            allow_editing: allow_editing === undefined ? template.allow_editing : Boolean(allow_editing),
        });

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

        if (Array.isArray(tags)) {
            const tagInstances = [];
            for (const tagName of tags) {
                const [tg] = await Tag.findOrCreate({ where: { name: tagName } });
                tagInstances.push(tg);
            }
            await template.setTags(tagInstances);
        }

        const updatedTemplate = await Template.findByPk(id, { include: [Tag] });
        return res.json({ message: 'Template updated successfully', template: updatedTemplate });
    } catch (err) {
        console.error('Error updating template:', err);
        return res.status(500).json({ error: 'Failed to update template' });
    }
});

// -----------------------------------
// DELETE /api/templates/:id
// -----------------------------------
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findByPk(id);
        if (!template) return res.status(404).json({ error: 'Template not found' });

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

// -----------------------------------
// GET /api/templates/:id/forms
// -----------------------------------
router.get('/:id/forms', authenticate, async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) return res.status(404).json({ error: 'Template not found' });

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