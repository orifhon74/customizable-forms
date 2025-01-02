const express = require('express');
const router = express.Router();
const { Form, Template } = require('../models');
const authenticate = require('../middleware/authenticate');

/**
 * GET /api/aggregator/:templateId
 * - Auth required: admin or template owner
 * - Returns aggregated data (example: average int, most common string, etc.)
 */
router.get('/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        // Check ownership or admin privileges
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Fetch all forms associated with the template
        const forms = await Form.findAll({ where: { template_id: templateId } });

        const totalForms = forms.length;
        if (totalForms === 0) {
            return res.json({ total_forms: 0, averages: {}, commonStrings: {}, checkboxStats: {} });
        }

        // Aggregate integer fields
        const intFields = ['custom_int1_answer', 'custom_int2_answer', 'custom_int3_answer', 'custom_int4_answer'];
        const averages = {};
        for (const field of intFields) {
            const validForms = forms.filter((f) => f[field] !== null && !isNaN(f[field]));
            const sum = validForms.reduce((acc, f) => acc + Number(f[field]), 0);
            averages[field] = validForms.length ? sum / validForms.length : null;
        }

        // Aggregate string fields (most frequent answer)
        const stringFields = ['custom_string1_answer', 'custom_string2_answer', 'custom_string3_answer', 'custom_string4_answer'];
        const commonStrings = {};
        for (const field of stringFields) {
            const frequencyMap = {};
            forms.forEach((form) => {
                const value = form[field];
                if (value) {
                    frequencyMap[value] = (frequencyMap[value] || 0) + 1;
                }
            });
            const mostCommon = Object.entries(frequencyMap).reduce(
                (max, entry) => (entry[1] > max[1] ? entry : max),
                [null, 0]
            )[0];
            commonStrings[field] = mostCommon || null;
        }

        // Aggregate checkbox fields (counts of true/false)
        const checkboxFields = ['custom_checkbox1_answer', 'custom_checkbox2_answer', 'custom_checkbox3_answer', 'custom_checkbox4_answer'];
        const checkboxStats = {};
        for (const field of checkboxFields) {
            const trueCount = forms.filter((f) => f[field] === true).length;
            const falseCount = forms.filter((f) => f[field] === false).length;
            checkboxStats[field] = { true: trueCount, false: falseCount };
        }

        res.json({
            total_forms: totalForms,
            averages,
            commonStrings,
            checkboxStats,
        });
    } catch (err) {
        console.error('Error aggregating data:', err.message);
        res.status(500).json({ error: 'Failed to get aggregation' });
    }
});

module.exports = router;