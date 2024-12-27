    const express = require('express');
    const router = express.Router();
    const Form = require('../models/Form');
    const Template = require('../models/Template');
    const authenticate = require('../middleware/authenticate');
    const {User} = require("../models");

    // Fetch all forms (specific to user)
    // router.get('/', authenticate, async (req, res) => {
    //     try {
    //         const forms = await Form.findAll({
    //             where: { user_id: req.user.id },
    //             include: [
    //                 { model: Template, attributes: ['id', 'title'] },
    //                 { model: User, attributes: ['id', 'username', 'email'] },
    //             ],
    //         });
    //         res.json(forms);
    //     } catch (err) {
    //         console.error('Error fetching forms:', err);
    //         res.status(500).json({ error: 'Failed to fetch forms' });
    //     }
    // });

    router.get('/', authenticate, async (req, res) => {
        try {
            const forms = await Form.findAll({
                where: { user_id: req.user.id },
                include: [
                    { model: Template, attributes: ['id', 'title'] },
                    { model: User, attributes: ['id', 'username', 'email'] }, // Include user details
                ],
            });
            res.json(forms);
        } catch (err) {
            console.error('Error fetching forms:', err);
            res.status(500).json({ error: 'Failed to fetch forms' });
        }
    });

    // Get a specific form
    router.get('/:id', authenticate, async (req, res) => {
        try {
            const form = await Form.findByPk(req.params.id, {
                include: [{ model: Template, as: 'Template' }],
            });

            if (!form) {
                return res.status(404).json({ error: 'Form not found' });
            }

            // Only allow access if the user owns the form or is an admin
            if (form.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied' });
            }

            res.json(form);
        } catch (err) {
            console.error('Error fetching form:', err);
            res.status(500).json({ error: 'Failed to fetch form' });
        }
    });

    router.post('/:templateId/submit', authenticate, async (req, res) => {
        try {
            const { templateId } = req.params;
            const template = await Template.findByPk(templateId);

            if (!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            const {
                string1_answer,
                string2_answer,
                string3_answer,
                string4_answer,
                int1_answer,
                int2_answer,
                int3_answer,
                int4_answer,
                checkbox1_answer,
                checkbox2_answer,
                checkbox3_answer,
                checkbox4_answer,
            } = req.body;

            // Validate answers based on template structure
            if (template.custom_string1_state && (!string1_answer || typeof string1_answer !== 'string')) {
                return res.status(400).json({ error: 'Invalid or missing string1_answer' });
            }
            if (template.custom_string2_state && (!string2_answer || typeof string2_answer !== 'string')) {
                return res.status(400).json({ error: 'Invalid or missing string2_answer' });
            }
            if (template.custom_string3_state && (!string3_answer || typeof string3_answer !== 'string')) {
                return res.status(400).json({ error: 'Invalid or missing string3_answer' });
            }
            if (template.custom_string4_state && (!string4_answer || typeof string4_answer !== 'string')) {
                return res.status(400).json({ error: 'Invalid or missing string4_answer' });
            }

            if (template.custom_int1_state && (isNaN(int1_answer) || int1_answer === null)) {
                return res.status(400).json({ error: 'Invalid or missing int1_answer' });
            }
            if (template.custom_int2_state && (isNaN(int2_answer) || int2_answer === null)) {
                return res.status(400).json({ error: 'Invalid or missing int2_answer' });
            }
            if (template.custom_int3_state && (isNaN(int3_answer) || int3_answer === null)) {
                return res.status(400).json({ error: 'Invalid or missing int3_answer' });
            }
            if (template.custom_int4_state && (isNaN(int4_answer) || int4_answer === null)) {
                return res.status(400).json({ error: 'Invalid or missing int4_answer' });
            }

            if (template.custom_checkbox1_state && typeof checkbox1_answer !== 'boolean') {
                return res.status(400).json({ error: 'Invalid checkbox1_answer' });
            }
            if (template.custom_checkbox2_state && typeof checkbox2_answer !== 'boolean') {
                return res.status(400).json({ error: 'Invalid checkbox2_answer' });
            }
            if (template.custom_checkbox3_state && typeof checkbox3_answer !== 'boolean') {
                return res.status(400).json({ error: 'Invalid checkbox3_answer' });
            }
            if (template.custom_checkbox4_state && typeof checkbox4_answer !== 'boolean') {
                return res.status(400).json({ error: 'Invalid checkbox4_answer' });
            }

            // Create the form with all provided answers
            const form = await Form.create({
                template_id: templateId,
                user_id: req.user.id,
                string1_answer: string1_answer || null,
                string2_answer: string2_answer || null,
                string3_answer: string3_answer || null,
                string4_answer: string4_answer || null,
                int1_answer: int1_answer || null,
                int2_answer: int2_answer || null,
                int3_answer: int3_answer || null,
                int4_answer: int4_answer || null,
                checkbox1_answer: checkbox1_answer || null,
                checkbox2_answer: checkbox2_answer || null,
                checkbox3_answer: checkbox3_answer || null,
                checkbox4_answer: checkbox4_answer || null,
            });

            res.status(201).json({ message: 'Form submitted successfully', form });
        } catch (err) {
            console.error('Error submitting form:', err);
            res.status(500).json({ error: 'Failed to submit form' });
        }
    });

    module.exports = router;