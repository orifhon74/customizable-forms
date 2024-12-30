// routes/aggregatorRoutes.js
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

        // check ownership or admin
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // fetch forms
        const forms = await Form.findAll({ where: { template_id: templateId } });

        const total = forms.length;
        if (!total) {
            return res.json({ total_forms: 0, averages: {}, commonStrings: {} });
        }

        // example aggregator: average of custom_intX_answer
        const intFields = ['custom_int1_answer', 'custom_int2_answer', 'custom_int3_answer', 'custom_int4_answer'];
        const averages = {};
        for (const field of intFields) {
            const valid = forms.filter((f) => f[field] !== null && !isNaN(f[field]));
            const sum = valid.reduce((acc, f) => acc + Number(f[field]), 0);
            averages[field] = valid.length ? sum / valid.length : 0;
        }

        // example aggregator: most frequent string for custom_stringX_answer
        const stringFields = ['custom_string1_answer', 'custom_string2_answer', 'custom_string3_answer', 'custom_string4_answer'];
        const commonStrings = {};
        for (const field of stringFields) {
            const freqMap = {};
            for (const f of forms) {
                if (f[field]) {
                    freqMap[f[field]] = (freqMap[f[field]] || 0) + 1;
                }
            }
            // find the string with the highest count
            let maxCount = 0;
            let mostCommon = null;
            for (const str in freqMap) {
                if (freqMap[str] > maxCount) {
                    maxCount = freqMap[str];
                    mostCommon = str;
                }
            }
            commonStrings[field] = mostCommon;
        }

        res.json({
            total_forms: total,
            averages,
            commonStrings,
        });
    } catch (err) {
        console.error('Error aggregating data:', err);
        res.status(500).json({ error: 'Failed to get aggregation' });
    }
});

module.exports = router;