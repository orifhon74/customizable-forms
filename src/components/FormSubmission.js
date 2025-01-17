// src/components/FormSubmission.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';

function FormSubmission() {
    const { templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('You must be logged in to view this form.');

                const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch template');
                }
                const data = await response.json();
                setTemplate(data);

                // Initialize answers state for each question to ''
                if (data.Questions) {
                    const initialAnswers = {};
                    data.Questions.forEach((q) => {
                        // For checkboxes, default to 'false'; otherwise empty string
                        initialAnswers[q.id] = q.question_type === 'checkbox' ? 'false' : '';
                    });
                    setAnswers(initialAnswers);
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchTemplate();
    }, [templateId, API_URL]);

    /**
     * Updates local 'answers' state when the user changes a question response
     */
    const handleChange = (questionId, questionType, value, checked) => {
        setAnswers((prev) => {
            // If questionType is 'checkbox', store 'true' or 'false' as a string
            if (questionType === 'checkbox') {
                return { ...prev, [questionId]: checked ? 'true' : 'false' };
            }
            // Otherwise, store the string value
            return { ...prev, [questionId]: value };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to submit a form');
            return;
        }

        try {
            // Convert our 'answers' object { questionId: "value", ... } to an array
            // e.g. [ { question_id: 101, answer_value: "Hello" }, ... ]
            const answersArray = Object.entries(answers).map(([qId, val]) => ({
                question_id: parseInt(qId, 10),
                answer_value: val,
            }));

            const response = await fetch(`${API_URL}/api/forms/${templateId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answers: answersArray }),
            });
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            setSuccess('Form submitted successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">Error: {error}</Alert>
            </Container>
        );
    }

    if (!template) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
                <p className="ms-3">Loading template...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4">Fill Out Form: {template.title}</h1>
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                {template.Questions && template.Questions.length > 0 ? (
                    template.Questions.map((question) => (
                        <Form.Group className="mb-3" key={question.id}>
                            <Form.Label>
                                {question.question_text}
                                {question.question_type === 'checkbox' && ' (Check if true)'}
                            </Form.Label>

                            {question.question_type === 'string' && (
                                <Form.Control
                                    type="text"
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleChange(question.id, question.question_type, e.target.value)
                                    }
                                />
                            )}

                            {question.question_type === 'multiline' && (
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleChange(question.id, question.question_type, e.target.value)
                                    }
                                />
                            )}

                            {question.question_type === 'integer' && (
                                <Form.Control
                                    type="number"
                                    value={answers[question.id] || ''}
                                    onChange={(e) =>
                                        handleChange(question.id, question.question_type, e.target.value)
                                    }
                                />
                            )}

                            {question.question_type === 'checkbox' && (
                                <Form.Check
                                    type="checkbox"
                                    checked={answers[question.id] === 'true'}
                                    onChange={(e) =>
                                        handleChange(question.id, question.question_type, e.target.value, e.target.checked)
                                    }
                                />
                            )}
                        </Form.Group>
                    ))
                ) : (
                    <Alert variant="info">
                        This template has no questions defined.
                    </Alert>
                )}

                <Button type="submit" variant="primary" className="w-100">
                    Submit Form
                </Button>
            </Form>
        </Container>
    );
}

export default FormSubmission;