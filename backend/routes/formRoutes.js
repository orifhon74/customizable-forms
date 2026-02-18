// routes/formRoutes.js

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Import models from your central models/index.js
const { Form, Template, User, Question, FormAnswer } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * -----------------------------------
 * GET /api/forms
 * Auth required
 * -----------------------------------
 * - If admin, fetch all forms
 * - Otherwise, fetch only forms that belong to the user's templates
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
            // Normal users only see forms from templates they own
            const userTemplates = await Template.findAll({
                where: { user_id: user.id },
            });
            const templateIds = userTemplates.map((t) => t.id);

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
 * -----------------------------------
 * GET /api/forms/:id
 * Auth required
 * -----------------------------------
 * - Fetch details of a specific form
 * - Only the template owner or an admin can see it
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [
                { model: Template }, // We need the template to check ownership
                { model: User, attributes: ['id', 'username'] },
                // Optionally include answers
                {
                  model: FormAnswer,
                    include: [{ model: Question, attributes: ['id', 'question_text'] }],
                },
            ],
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Check ownership or admin
        if (req.user.role !== 'admin' && req.user.id !== form.Template.user_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(form);
    } catch (err) {
        console.error('Error fetching form details:', err);
        res.status(500).json({ error: 'Failed to fetch form details' });
    }
});

/**
 * -----------------------------------
 * POST /api/forms/:templateId/submit
 * Auth required
 * -----------------------------------
 * - Submits a new form referencing unlimited questions
 */
router.post('/:templateId/submit', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // If template is private, only owner or admin can fill
        if (
            template.access_type !== 'public' &&
            template.user_id !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Access denied: Template is private' });
        }

        // The request body should contain "answers" array:
        // e.g. { answers: [ {question_id, answer_value}, {question_id, answer_value} ] }
        const { answers = [] } = req.body;

        // 1) Create the Form record
        const form = await Form.create({
            template_id: templateId,
            user_id: req.user.id,
        });

        // 2) Create a FormAnswer row for each answer
        // Example answer: { question_id: 12, answer_value: "Yes" }
        for (const ans of answers) {
            // (Optional) verify question belongs to this template
            const question = await Question.findOne({
                where: { id: ans.question_id, template_id: templateId },
            });
            if (!question) {
                // skip or throw error
                continue;
            }

            await FormAnswer.create({
                form_id: form.id,
                question_id: ans.question_id,
                answer_value: ans.answer_value,
            });
        }

        res.status(201).json({
            message: 'Form submitted successfully',
            form_id: form.id,
        });
    } catch (err) {
        console.error('Error submitting form:', err);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

/**
 * -----------------------------------
 * GET /api/forms/template/:templateId
 * Auth required
 * -----------------------------------
 * - Get all forms for a specific template
 * - Only admin or template owner can see them
 */
router.get('/template/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        // Find the template
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check if user is admin or owner of the template (or if it's public, you might allow reading?)
        if (
            req.user.role !== 'admin' &&
            req.user.id !== template.user_id &&
            template.access_type !== 'public'
        ) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get all forms for that template
        // const forms = await Form.findAll({ where: { template_id: templateId } });

        const forms = await Form.findAll({
            where: { template_id: templateId },
            include: [
                // The user who submitted, if you want it
                { model: User, attributes: ['id', 'username'] },
                // The form’s answers
                {
                    model: FormAnswer,
                    include: [
                        {
                            model: Question,
                            attributes: ['id', 'question_text', 'question_type'],
                        },
                    ],
                },
            ],
        });

        // If you want to filter forms further, e.g., only show user’s own forms,
        // you can do so. But typically, the template owner can see them all.
        const filteredForms = forms.filter(
            (form) =>
                req.user.role === 'admin' ||
                form.user_id === req.user.id ||
                req.user.id === template.user_id
        );

        res.json(filteredForms);
    } catch (err) {
        console.error('Error fetching forms:', err);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

/**
 * -----------------------------------
 * PUT /api/forms/:id
 * Auth required: only admin or template owner
 * -----------------------------------
 * - Updates a form's answers (FormAnswers)
 * - Does NOT allow changing form.template_id or form.user_id
 */
router.put('/:id', authenticate, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Expect: { FormAnswers: [{ question_id, answer_value }, ...] }
        const { FormAnswers } = req.body;

        const form = await Form.findByPk(id, {
            include: [{ model: Template }],
            transaction: t,
        });

        if (!form) {
            await t.rollback();
            return res.status(404).json({ error: 'Form not found' });
        }

        // Ownership check
        if (req.user.role !== 'admin' && req.user.id !== form.Template.user_id) {
            await t.rollback();
            return res.status(403).json({ error: 'Unauthorized to edit this form' });
        }

        // Validate payload
        if (!Array.isArray(FormAnswers)) {
            await t.rollback();
            return res.status(400).json({
                error: 'Invalid payload. Expected "FormAnswers" as an array.',
            });
        }

        // Optional: ensure all questions belong to this template
        // (prevents editing by injecting random question_ids)
        const templateQuestions = await Question.findAll({
            where: { template_id: form.template_id },
            attributes: ['id', 'question_type'],
            transaction: t,
        });
        const allowedQuestionIds = new Set(templateQuestions.map((q) => q.id));

        for (const fa of FormAnswers) {
            if (!fa || typeof fa.question_id !== 'number') {
                await t.rollback();
                return res.status(400).json({ error: 'Each answer must include a numeric question_id.' });
            }
            if (!allowedQuestionIds.has(fa.question_id)) {
                await t.rollback();
                return res.status(400).json({
                    error: `Question ${fa.question_id} does not belong to this template.`,
                });
            }
        }

        // Replace strategy: delete existing answers then insert new ones
        await FormAnswer.destroy({
            where: { form_id: form.id },
            transaction: t,
        });

        // Insert new answers
        // Normalize values to strings (your app uses 'true'/'false' for checkbox)
        const rows = FormAnswers.map((fa) => ({
            form_id: form.id,
            question_id: fa.question_id,
            answer_value: String(fa.answer_value ?? ''),
        }));

        if (rows.length > 0) {
            await FormAnswer.bulkCreate(rows, { transaction: t });
        }

        await t.commit();

        // Return the updated form including answers
        const updatedForm = await Form.findByPk(id, {
            include: [
                { model: Template },
                { model: User, attributes: ['id', 'username', 'email'] },
                {
                    model: FormAnswer,
                    include: [{ model: Question, attributes: ['id', 'question_text', 'question_type'] }],
                },
            ],
        });

        return res.json({ message: 'Form updated successfully', form: updatedForm });
    } catch (err) {
        await t.rollback();
        console.error('Error updating form:', err);
        return res.status(500).json({ error: 'Failed to update form' });
    }
});

/**
 * -----------------------------------
 * DELETE /api/forms/:id
 * Auth required: only admin or template owner
 * -----------------------------------
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findByPk(id, { include: [Template] });
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Only template owner or admin can delete
        if (req.user.role !== 'admin' && req.user.id !== form.Template.user_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this form' });
        }

        await form.destroy();
        return res.json({ message: 'Form deleted successfully' });
    } catch (err) {
        console.error('Error deleting form:', err);
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

module.exports = router;