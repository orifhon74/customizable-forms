// src/components/FormSubmission.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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

    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!template) return <div>Loading template...</div>;

    return (
        <div style={{ margin: '20px' }}>
            <h1>Fill Out Form: {template.title}</h1>
            <form onSubmit={handleSubmit}>
                {/* Single-line string questions */}
                {template.custom_string1_state && (
                    <div>
                        <label>{template.custom_string1_question}</label>
                        <input type="text" name="custom_string1_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_string2_state && (
                    <div>
                        <label>{template.custom_string2_question}</label>
                        <input type="text" name="custom_string2_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_string3_state && (
                    <div>
                        <label>{template.custom_string3_question}</label>
                        <input type="text" name="custom_string3_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_string4_state && (
                    <div>
                        <label>{template.custom_string4_question}</label>
                        <input type="text" name="custom_string4_answer" onChange={handleChange} />
                    </div>
                )}

                {/* Multi-line text questions */}
                {template.custom_multiline1_state && (
                    <div>
                        <label>{template.custom_multiline1_question}</label>
                        <textarea name="custom_multiline1_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_multiline2_state && (
                    <div>
                        <label>{template.custom_multiline2_question}</label>
                        <textarea name="custom_multiline2_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_multiline3_state && (
                    <div>
                        <label>{template.custom_multiline3_question}</label>
                        <textarea name="custom_multiline3_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_multiline4_state && (
                    <div>
                        <label>{template.custom_multiline4_question}</label>
                        <textarea name="custom_multiline4_answer" onChange={handleChange} />
                    </div>
                )}

                {/* Integer questions */}
                {template.custom_int1_state && (
                    <div>
                        <label>{template.custom_int1_question}</label>
                        <input type="number" name="custom_int1_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_int2_state && (
                    <div>
                        <label>{template.custom_int2_question}</label>
                        <input type="number" name="custom_int2_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_int3_state && (
                    <div>
                        <label>{template.custom_int3_question}</label>
                        <input type="number" name="custom_int3_answer" onChange={handleChange} />
                    </div>
                )}
                {template.custom_int4_state && (
                    <div>
                        <label>{template.custom_int4_question}</label>
                        <input type="number" name="custom_int4_answer" onChange={handleChange} />
                    </div>
                )}

                {/* Checkbox questions */}
                {template.custom_checkbox1_state && (
                    <div>
                        <label>
                            <input type="checkbox" name="custom_checkbox1_answer" onChange={handleChange} />
                            {template.custom_checkbox1_question}
                        </label>
                    </div>
                )}
                {template.custom_checkbox2_state && (
                    <div>
                        <label>
                            <input type="checkbox" name="custom_checkbox2_answer" onChange={handleChange} />
                            {template.custom_checkbox2_question}
                        </label>
                    </div>
                )}
                {template.custom_checkbox3_state && (
                    <div>
                        <label>
                            <input type="checkbox" name="custom_checkbox3_answer" onChange={handleChange} />
                            {template.custom_checkbox3_question}
                        </label>
                    </div>
                )}
                {template.custom_checkbox4_state && (
                    <div>
                        <label>
                            <input type="checkbox" name="custom_checkbox4_answer" onChange={handleChange} />
                            {template.custom_checkbox4_question}
                        </label>
                    </div>
                )}

                <button type="submit">Submit Form</button>
            </form>
            {success && <div style={{ color: 'green' }}>{success}</div>}
        </div>
    );
}

export default FormSubmission;