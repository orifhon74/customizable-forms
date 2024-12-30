// src/components/FormSubmission.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

function FormSubmission() {
    const { templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch template');
                }
                const data = await response.json();
                setTemplate(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchTemplate();
    }, [templateId, token]);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const resp = await fetch(`http://localhost:5001/api/forms/${templateId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!resp.ok) {
                const data = await resp.json().catch(() => null);
                throw new Error(data?.error || 'Failed to submit form');
            }
            setSuccess('Form submitted successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <Alert variant="danger">Error: {error}</Alert>;
    if (!template) return <div>Loading template...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h1>Fill Out Form: {template.title}</h1>
            <hr />

            <Form onSubmit={handleSubmit}>
                {/* Single-line string questions */}
                {template.custom_string1_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_string1_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_string2_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_string2_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string2_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_string3_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_string3_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string3_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_string4_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_string4_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string4_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                {/* Multi-line text questions */}
                {template.custom_multiline1_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_multiline1_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="custom_multiline1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_multiline2_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_multiline2_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="custom_multiline1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_multiline3_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_multiline3_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="custom_multiline1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_multiline4_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_multiline4_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="custom_multiline1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                {/* Integer questions */}
                {template.custom_int1_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_int1_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_int2_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_int2_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_int3_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_int3_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_int4_state && (
                    <Form.Group className="mb-3">
                        <Form.Label>{template.custom_int4_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                {/* Checkbox questions */}
                {template.custom_checkbox1_state && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox1_question}
                            name="custom_checkbox1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_checkbox2_state && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox2_question}
                            name="custom_checkbox1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_checkbox3_state && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox3_question}
                            name="custom_checkbox1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_checkbox4_state && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox4_question}
                            name="custom_checkbox1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                <Button variant="primary" type="submit">
                    Submit Form
                </Button>
            </Form>

            {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        </div>
    );
}

export default FormSubmission;