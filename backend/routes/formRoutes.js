// routes/formRoutes.js

const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const authenticate = require("../middleware/authenticate");

// ✅ IMPORTANT: include sequelize here
const { sequelize, Form, Template, User, Question, FormAnswer } = require("../models");

/**
 * -----------------------------------
 * GET /api/forms
 * Auth required
 * -----------------------------------
 * - If admin, fetch all forms
 * - Otherwise, fetch only forms that belong to the user's templates
 */
router.get("/", authenticate, async (req, res) => {
    try {
        const user = req.user;
        let forms;

        if (user.role === "admin") {
            // Admin sees all forms
            forms = await Form.findAll({
                include: [
                    { model: Template, attributes: ["id", "title"] },
                    { model: User, attributes: ["id", "username"] },
                ],
                order: [["createdAt", "DESC"]],
            });
        } else {
            // Normal users only see forms from templates they own
            const userTemplates = await Template.findAll({
                where: { user_id: user.id },
                attributes: ["id"],
            });

            const templateIds = userTemplates.map((t) => t.id);

            // If user has no templates, return []
            if (templateIds.length === 0) {
                return res.json([]);
            }

            forms = await Form.findAll({
                // ✅ use Op.in
                where: { template_id: { [Op.in]: templateIds } },
                include: [
                    { model: Template, attributes: ["id", "title"] },
                    { model: User, attributes: ["id", "username"] },
                ],
                order: [["createdAt", "DESC"]],
            });
        }

        res.json(forms);
    } catch (err) {
        console.error("Error fetching forms:", err);
        res.status(500).json({ error: "Failed to fetch forms" });
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
router.get("/:id", authenticate, async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [
                { model: Template }, // need template for ownership check
                { model: User, attributes: ["id", "username"] },
                {
                    model: FormAnswer,
                    include: [
                        {
                            model: Question,
                            // ✅ include question_type because UI checks it
                            attributes: ["id", "question_text", "question_type"],
                        },
                    ],
                },
            ],
        });

        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        // Only template owner or admin
        if (req.user.role !== "admin" && req.user.id !== form.Template.user_id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        res.json(form);
    } catch (err) {
        console.error("Error fetching form details:", err);
        res.status(500).json({ error: "Failed to fetch form details" });
    }
});

/**
 * -----------------------------------
 * POST /api/forms/:templateId/submit
 * Auth required
 * -----------------------------------
 * - Submits a new form referencing unlimited questions
 */
router.post("/:templateId/submit", authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // If template is private, only owner or admin can fill
        if (
            template.access_type !== "public" &&
            template.user_id !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ error: "Access denied: Template is private" });
        }

        const { answers = [] } = req.body;

        // 1) Create the Form record
        const form = await Form.create({
            template_id: templateId,
            user_id: req.user.id,
        });

        // 2) Create FormAnswer rows
        for (const ans of answers) {
            if (!ans || typeof ans.question_id !== "number") continue;

            // Optional: verify question belongs to this template
            const question = await Question.findOne({
                where: { id: ans.question_id, template_id: templateId },
            });

            if (!question) continue;

            await FormAnswer.create({
                form_id: form.id,
                question_id: ans.question_id,
                answer_value: String(ans.answer_value ?? ""),
            });
        }

        res.status(201).json({
            message: "Form submitted successfully",
            form_id: form.id,
        });
    } catch (err) {
        console.error("Error submitting form:", err);
        res.status(500).json({ error: "Failed to submit form" });
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
router.get("/template/:templateId", authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // Check if user is admin or owner (or allow if public)
        if (
            req.user.role !== "admin" &&
            req.user.id !== template.user_id &&
            template.access_type !== "public"
        ) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const forms = await Form.findAll({
            where: { template_id: templateId },
            include: [
                { model: User, attributes: ["id", "username"] },
                {
                    model: FormAnswer,
                    include: [
                        { model: Question, attributes: ["id", "question_text", "question_type"] },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const filteredForms = forms.filter(
            (form) =>
                req.user.role === "admin" ||
                form.user_id === req.user.id ||
                req.user.id === template.user_id
        );

        res.json(filteredForms);
    } catch (err) {
        console.error("Error fetching forms:", err);
        res.status(500).json({ error: "Failed to fetch forms" });
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
router.put("/:id", authenticate, async (req, res) => {
    let t;
    try {
        t = await sequelize.transaction();

        const { id } = req.params;
        const { FormAnswers } = req.body;

        const form = await Form.findByPk(id, {
            include: [{ model: Template }],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!form) {
            await t.rollback();
            return res.status(404).json({ error: "Form not found" });
        }

        // Ownership check
        if (req.user.role !== "admin" && req.user.id !== form.Template.user_id) {
            await t.rollback();
            return res.status(403).json({ error: "Unauthorized to edit this form" });
        }

        // Validate payload
        if (!Array.isArray(FormAnswers)) {
            await t.rollback();
            return res.status(400).json({
                error: 'Invalid payload. Expected "FormAnswers" as an array.',
            });
        }

        // Ensure all questions belong to this template
        const templateQuestions = await Question.findAll({
            where: { template_id: form.template_id },
            attributes: ["id"],
            transaction: t,
        });

        const allowedQuestionIds = new Set(templateQuestions.map((q) => q.id));

        for (const fa of FormAnswers) {
            if (!fa || typeof fa.question_id !== "number") {
                await t.rollback();
                return res
                    .status(400)
                    .json({ error: "Each answer must include a numeric question_id." });
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

        const rows = FormAnswers.map((fa) => ({
            form_id: form.id,
            question_id: fa.question_id,
            answer_value: String(fa.answer_value ?? ""),
        }));

        if (rows.length > 0) {
            await FormAnswer.bulkCreate(rows, { transaction: t });
        }

        await t.commit();

        // Return updated form
        const updatedForm = await Form.findByPk(id, {
            include: [
                { model: Template },
                { model: User, attributes: ["id", "username", "email"] },
                {
                    model: FormAnswer,
                    include: [{ model: Question, attributes: ["id", "question_text", "question_type"] }],
                },
            ],
        });

        return res.json({ message: "Form updated successfully", form: updatedForm });
    } catch (err) {
        if (t) await t.rollback();
        console.error("Error updating form:", err);
        return res.status(500).json({ error: "Failed to update form" });
    }
});

/**
 * -----------------------------------
 * DELETE /api/forms/:id
 * Auth required: only admin or template owner
 * -----------------------------------
 */
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const form = await Form.findByPk(id, { include: [Template] });
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        // Only template owner or admin can delete
        if (req.user.role !== "admin" && req.user.id !== form.Template.user_id) {
            return res.status(403).json({ error: "Unauthorized to delete this form" });
        }

        await form.destroy();
        return res.json({ message: "Form deleted successfully" });
    } catch (err) {
        console.error("Error deleting form:", err);
        res.status(500).json({ error: "Failed to delete form" });
    }
});

module.exports = router;