// routes/formRoutes.js

const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const authenticate = require("../middleware/authenticate");

// Import sequelize + models from central models/index.js
const { sequelize, Form, Template, User, Question, FormAnswer } = require("../models");

/**
 * Helper: check if a user can VIEW a specific form
 * - admin OR template owner OR submitter
 */
function canViewForm(reqUser, form) {
    if (!reqUser || !form) return false;
    if (reqUser.role === "admin") return true;
    if (form.Template && reqUser.id === form.Template.user_id) return true; // template owner
    if (reqUser.id === form.user_id) return true; // submitter
    return false;
}

/**
 * Helper: check if a user can EDIT a specific form
 * - admin OR template owner OR (submitter AND template.allow_form_editing)
 */
function canEditForm(reqUser, form) {
    if (!reqUser || !form) return false;
    if (reqUser.role === "admin") return true;

    const isOwner = form.Template && reqUser.id === form.Template.user_id;
    if (isOwner) return true;

    const isSubmitter = reqUser.id === form.user_id;
    const allowSubmitterEdit = Boolean(form.Template?.allow_form_editing);

    return isSubmitter && allowSubmitterEdit;
}

/**
 * Helper: check if a user can DELETE a specific form
 * - admin OR template owner OR submitter
 * (You can tighten this if you want submitters not to delete)
 */
function canDeleteForm(reqUser, form) {
    if (!reqUser || !form) return false;
    if (reqUser.role === "admin") return true;

    const isOwner = form.Template && reqUser.id === form.Template.user_id;
    if (isOwner) return true;

    const isSubmitter = reqUser.id === form.user_id;
    return isSubmitter;
}

/**
 * -----------------------------------
 * GET /api/forms
 * Auth required
 * -----------------------------------
 * - Admin: all forms
 * - Normal user: ONLY forms they personally submitted
 */
router.get("/", authenticate, async (req, res) => {
    try {
        const user = req.user;

        const whereClause =
            user.role === "admin"
                ? {}
                : { user_id: user.id }; // ✅ user's own submissions

        const forms = await Form.findAll({
            where: whereClause,
            include: [
                {
                    model: Template,
                    attributes: ["id", "title", "user_id", "allow_form_editing"],
                },
                { model: User, attributes: ["id", "username"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(forms);
    } catch (err) {
        console.error("Error fetching forms:", err);
        res.status(500).json({ error: "Failed to fetch forms" });
    }
});

/**
 * -----------------------------------
 * GET /api/forms/template/:templateId
 * Auth required
 * -----------------------------------
 * - Template owner/admin can see ALL submissions for that template
 */
router.get("/template/:templateId", authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = await Template.findByPk(templateId, {
            attributes: ["id", "title", "user_id", "access_type", "allow_form_editing"],
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // Only admin or template owner can see all submissions for a template
        if (req.user.role !== "admin" && req.user.id !== template.user_id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const forms = await Form.findAll({
            where: { template_id: templateId },
            include: [
                { model: Template, attributes: ["id", "title", "user_id", "allow_form_editing"] },
                { model: User, attributes: ["id", "username"] },
                {
                    model: FormAnswer,
                    include: [{ model: Question, attributes: ["id", "question_text", "question_type"] }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(forms);
    } catch (err) {
        console.error("Error fetching forms for template:", err);
        res.status(500).json({ error: "Failed to fetch forms" });
    }
});

/**
 * -----------------------------------
 * GET /api/forms/:id
 * Auth required
 * -----------------------------------
 * - Admin OR template owner OR submitter can view it
 */
router.get("/:id", authenticate, async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [
                { model: Template }, // includes allow_form_editing if your model has it
                { model: User, attributes: ["id", "username"] },
                {
                    model: FormAnswer,
                    include: [
                        { model: Question, attributes: ["id", "question_text", "question_type"] },
                    ],
                },
            ],
        });

        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        if (!canViewForm(req.user, form)) {
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
 * - Submit a new form
 */
router.post("/:templateId/submit", authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = await Template.findByPk(templateId, {
            attributes: ["id", "user_id", "access_type"],
        });
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

            const question = await Question.findOne({
                where: { id: ans.question_id, template_id: templateId },
                attributes: ["id"],
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
 * PUT /api/forms/:id
 * Auth required
 * -----------------------------------
 * - Admin OR template owner OR (submitter if template.allow_form_editing === true)
 * - Updates answers (replace strategy)
 */
router.put("/:id", authenticate, async (req, res) => {
    let t;
    try {
        t = await sequelize.transaction();

        const { id } = req.params;
        const { FormAnswers } = req.body;

        const form = await Form.findByPk(id, {
            include: [{ model: Template }], // must include allow_form_editing + owner id
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!form) {
            await t.rollback();
            return res.status(404).json({ error: "Form not found" });
        }

        if (!canEditForm(req.user, form)) {
            await t.rollback();
            return res.status(403).json({ error: "Unauthorized to edit this form" });
        }

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
                { model: Template, attributes: ["id", "title", "user_id", "allow_form_editing"] },
                { model: User, attributes: ["id", "username", "email"] },
                {
                    model: FormAnswer,
                    include: [
                        { model: Question, attributes: ["id", "question_text", "question_type"] },
                    ],
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
 * Auth required
 * -----------------------------------
 * - Admin OR template owner OR submitter can delete
 */
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const form = await Form.findByPk(id, {
            include: [{ model: Template }],
        });

        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        if (!canDeleteForm(req.user, form)) {
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