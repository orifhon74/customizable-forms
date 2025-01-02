// src/components/FormSubmission.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';


function FormSubmission() {
    const { templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
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
    }, [templateId]);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to submit a form');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/forms/${templateId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
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
                {/* Single-line string questions */}
                {template.custom_string1_state && (
                    <Form.Group className="mb-3" controlId="custom_string1">
                        <Form.Label>{template.custom_string1_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_string2_state && (
                    <Form.Group className="mb-3" controlId="custom_string2">
                        <Form.Label>{template.custom_string2_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string2_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_string3_state && (
                    <Form.Group className="mb-3" controlId="custom_string3">
                        <Form.Label>{template.custom_string3_question}</Form.Label>
                        <Form.Control
                            type="text"
                            name="custom_string3_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_string4_state && (
                    <Form.Group className="mb-3" controlId="custom_string4">
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
                    <Form.Group className="mb-3" controlId="custom_multiline1">
                        <Form.Label>{template.custom_multiline1_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="custom_multiline1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_multiline2_state && (
                    <Form.Group className="mb-3" controlId="custom_multiline2">
                        <Form.Label>{template.custom_multiline2_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="custom_multiline2_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_multiline3_state && (
                    <Form.Group className="mb-3" controlId="custom_multiline3">
                        <Form.Label>{template.custom_multiline3_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="custom_multiline3_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_multiline4_state && (
                    <Form.Group className="mb-3" controlId="custom_multiline4">
                        <Form.Label>{template.custom_multiline4_question}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="custom_multiline4_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                {/* Integer questions */}
                {template.custom_int1_state && (
                    <Form.Group className="mb-3" controlId="custom_int1">
                        <Form.Label>{template.custom_int1_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_int2_state && (
                    <Form.Group className="mb-3" controlId="custom_int2">
                        <Form.Label>{template.custom_int2_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int2_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_int3_state && (
                    <Form.Group className="mb-3" controlId="custom_int3">
                        <Form.Label>{template.custom_int3_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int3_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_int4_state && (
                    <Form.Group className="mb-3" controlId="custom_int4">
                        <Form.Label>{template.custom_int4_question}</Form.Label>
                        <Form.Control
                            type="number"
                            name="custom_int4_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                {/* Checkbox questions */}
                {template.custom_checkbox1_state && (
                    <Form.Group className="mb-3" controlId="custom_checkbox1">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox1_question}
                            name="custom_checkbox1_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_checkbox2_state && (
                    <Form.Group className="mb-3" controlId="custom_checkbox2">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox2_question}
                            name="custom_checkbox2_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_checkbox3_state && (
                    <Form.Group className="mb-3" controlId="custom_checkbox3">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox3_question}
                            name="custom_checkbox3_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}
                {template.custom_checkbox4_state && (
                    <Form.Group className="mb-3" controlId="custom_checkbox4">
                        <Form.Check
                            type="checkbox"
                            label={template.custom_checkbox4_question}
                            name="custom_checkbox4_answer"
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                <Button type="submit" variant="primary" className="w-100">
                    Submit Form
                </Button>
            </Form>
        </Container>
    );
}

export default FormSubmission;