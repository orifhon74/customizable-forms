// src/components/EditForm.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Form,
    Button,
    Alert,
    Spinner,
    Row,
    Col
} from 'react-bootstrap';

function EditForm() {
    const { formId } = useParams();
    const navigate = useNavigate();

    const [formRecord, setFormRecord] = useState(null);     // The Form object
    const [template, setTemplate] = useState(null);         // The Template object (with Questions)
    const [answers, setAnswers] = useState({});             // question_id => answer_value
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFormAndTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token. Please log in.');

                // 1) Fetch the form, including FormAnswers -> Question
                const formRes = await fetch(`${API_URL}/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!formRes.ok) {
                    throw new Error('Failed to fetch form for editing');
                }
                const formData = await formRes.json();
                setFormRecord(formData);

                // 2) Fetch the template associated with this form
                const templateRes = await fetch(`${API_URL}/api/templates/${formData.template_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!templateRes.ok) {
                    throw new Error('Failed to fetch template for form');
                }
                const templateData = await templateRes.json();
                setTemplate(templateData);

                // 3) Initialize local "answers" from formData.FormAnswers
                if (formData.FormAnswers) {
                    const initialAnswers = {};
                    formData.FormAnswers.forEach((fa) => {
                        initialAnswers[fa.question_id] = fa.answer_value;
                    });
                    setAnswers(initialAnswers);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchFormAndTemplate();
    }, [formId, API_URL]);

    /**
     * Handle changes for each answer field
     */
    const handleAnswerChange = (questionId, questionType, value, checked) => {
        setAnswers((prev) => {
            if (questionType === 'checkbox') {
                return { ...prev, [questionId]: checked ? 'true' : 'false' };
            }
            return { ...prev, [questionId]: value };
        });
    };

    /**
     * Submit updated answers
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            // Convert local 'answers' object into array for the backend
            // e.g. [ { question_id: x, answer_value: "someVal" }, ... ]
            const updatedFormAnswers = Object.entries(answers).map(([qId, val]) => ({
                question_id: parseInt(qId, 10),
                answer_value: val,
            }));

            // Build the request body. We include other form fields if needed.
            // e.g. user_id, template_id. Typically you only need form_id + updated answers.
            const requestBody = {
                ...formRecord,
                FormAnswers: updatedFormAnswers,
            };

            // PUT to /api/forms/:id
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error('Failed to update form');
            }

            setSuccess('Form updated successfully!');
            navigate(-1); // Go back in history
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

    if (!formRecord || !template) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
                <p className="ms-3">Loading form...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4">Edit Form</h1>

            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                {/* Map over all the questions from the template */}
                {template.Questions && template.Questions.length > 0 ? (
                    <Row>
                        {template.Questions.map((q) => {
                            const currentVal = answers[q.id] || '';
                            return (
                                <Col xs={12} md={6} className="mb-3" key={q.id}>
                                    <Form.Group>
                                        <Form.Label>{q.question_text}</Form.Label>
                                        {q.question_type === 'string' && (
                                            <Form.Control
                                                type="text"
                                                value={currentVal}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value)
                                                }
                                            />
                                        )}
                                        {q.question_type === 'multiline' && (
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={currentVal}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value)
                                                }
                                            />
                                        )}
                                        {q.question_type === 'integer' && (
                                            <Form.Control
                                                type="number"
                                                value={currentVal}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value)
                                                }
                                            />
                                        )}
                                        {q.question_type === 'checkbox' && (
                                            <Form.Check
                                                type="checkbox"
                                                label="Check if true"
                                                checked={currentVal === 'true'}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value, e.target.checked)
                                                }
                                            />
                                        )}
                                    </Form.Group>
                                </Col>
                            );
                        })}
                    </Row>
                ) : (
                    <Alert variant="info">No questions found for this template.</Alert>
                )}

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Container>
    );
}

export default EditForm;