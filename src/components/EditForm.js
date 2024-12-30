// EditForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

function EditForm() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [form, setForm] = useState({});
    const [template, setTemplate] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchFormAndTemplate = async () => {
            try {
                const formResp = await fetch(`http://localhost:5001/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!formResp.ok) throw new Error('Failed to fetch form');
                const formData = await formResp.json();
                setForm(formData);

                const templateResp = await fetch(`http://localhost:5001/api/templates/${formData.template_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!templateResp.ok) throw new Error('Failed to fetch template');
                const templateData = await templateResp.json();
                setTemplate(templateData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFormAndTemplate();
    }, [formId, token]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const resp = await fetch(`http://localhost:5001/api/forms/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            if (!resp.ok) {
                const data = await resp.json().catch(() => null);
                throw new Error(data?.error || 'Failed to update form');
            }
            setSuccess('Form updated successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!template) return <div>Loading form...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h1>Edit Form for Template: {template.title}</h1>
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                {Object.keys(form)
                    .filter((key) => key.includes('_answer'))
                    .map((key) => {
                        const questionKey = key.replace('_answer', '_question');
                        const questionText = template[questionKey];
                        if (!questionText) return null;

                        // If it's a boolean field, it's a checkbox
                        if (typeof form[key] === 'boolean') {
                            return (
                                <Form.Group className="mb-3" key={key}>
                                    <Form.Check
                                        type="checkbox"
                                        label={questionText}
                                        name={key}
                                        checked={!!form[key]}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            );
                        } else {
                            // Otherwise text field
                            return (
                                <Form.Group className="mb-3" key={key}>
                                    <Form.Label>{questionText}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name={key}
                                        value={form[key] || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            );
                        }
                    })}

                <Button variant="primary" type="submit">
                    Save Changes
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </Form>
        </div>
    );
}

export default EditForm;