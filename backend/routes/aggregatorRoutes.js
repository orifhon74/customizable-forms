// routes/aggregatorRoutes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { Form, Template, Question, FormAnswer } = require('../models');

/**
 * GET /api/unlimited-aggregator/:templateId
 * - Auth required: admin or template owner
 * - Returns aggregated data for the unlimited questions approach
 */
router.get('/unlimited/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;

        // 1) Check ownership or admin
        const template = await Template.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        if (template.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // 2) Fetch forms for this template
        const forms = await Form.findAll({ where: { template_id: templateId } });
        const totalForms = forms.length;
        if (totalForms === 0) {
            return res.json({
                totalForms: 0,
                numericAverages: [],
                commonStrings: [],
                checkboxStats: [],
            });
        }

        // 3) Get all form IDs for this template
        const formIds = forms.map((f) => f.id);

        // 4) Fetch all FormAnswers for those forms, including their Question
        const answers = await FormAnswer.findAll({
            where: { form_id: formIds },
            include: [{ model: Question }],
        });
        // So each answer looks like:
        // {
        //   id: 999,
        //   form_id: 123,
        //   question_id: 101,
        //   answer_value: "some text or true/false"
        //   Question: { id: 101, question_text, question_type, template_id }
        // }

        // We'll group them by question_id
        const answersByQuestion = {};
        answers.forEach((fa) => {
            const qid = fa.question_id;
            if (!answersByQuestion[qid]) {
                answersByQuestion[qid] = { question: fa.Question, answers: [] };
            }
            answersByQuestion[qid].answers.push(fa.answer_value);
        });

        // Prepare arrays to return in the response
        const numericAverages = [];   // { question_id, question_text, average }
        const commonStrings = [];     // { question_id, question_text, mostCommon }
        const checkboxStats = [];     // { question_id, question_text, trueCount, falseCount }

        // 5) For each question group, determine stats based on question_type
        Object.values(answersByQuestion).forEach((group) => {
            const { question, answers } = group;
            const qType = question.question_type;
            const qId = question.id;
            const qText = question.question_text;

            if (qType === 'integer') {
                // Convert all answer_value to number, filter out invalid
                const validNums = answers
                    .map((val) => Number(val))
                    .filter((v) => !isNaN(v));
                if (validNums.length > 0) {
                    const sum = validNums.reduce((acc, n) => acc + n, 0);
                    const avg = sum / validNums.length;
                    numericAverages.push({
                        question_id: qId,
                        question_text: qText,
                        average: avg,
                    });
                } else {
                    numericAverages.push({
                        question_id: qId,
                        question_text: qText,
                        average: null,
                    });
                }
            } else if (qType === 'string' || qType === 'multiline') {
                // Find most common string
                const freqMap = {};
                answers.forEach((val) => {
                    if (!val) return;
                    freqMap[val] = (freqMap[val] || 0) + 1;
                });
                let mostCommon = null;
                let maxCount = 0;
                Object.entries(freqMap).forEach(([val, count]) => {
                    if (count > maxCount) {
                        mostCommon = val;
                        maxCount = count;
                    }
                });
                commonStrings.push({
                    question_id: qId,
                    question_text: qText,
                    mostCommon: mostCommon || null,
                });
            } else if (qType === 'checkbox') {
                // Count 'true' vs 'false'
                let trueCount = 0;
                let falseCount = 0;
                answers.forEach((val) => {
                    if (val === 'true') trueCount++;
                    else falseCount++;
                });
                checkboxStats.push({
                    question_id: qId,
                    question_text: qText,
                    trueCount,
                    falseCount,
                });
            }
            // If you have more question types, handle them similarly
        });

        // 6) Return aggregated data
        return res.json({
            totalForms,
            numericAverages,
            commonStrings,
            checkboxStats,
        });
    } catch (err) {
        console.error('Error aggregating data (unlimited approach):', err.message);
        res.status(500).json({ error: 'Failed to get aggregation' });
    }
});

module.exports = router;