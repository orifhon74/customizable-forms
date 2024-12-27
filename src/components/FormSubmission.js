import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function FormSubmission() {
    const { templateId } = useParams(); // Extract templateId from the route
    const [template, setTemplate] = useState(null); // Template data
    const [formData, setFormData] = useState({}); // Form data to submit
    const [error, setError] = useState(null); // Error message
    const [success, setSuccess] = useState(null); // Success message

    // Fetch template details on component mount
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch template');
                }

                const data = await response.json();
                setTemplate(data); // Assuming you're using React state
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchTemplate();
    }, [templateId]); // Ensure templateId is passed correctly

    // Handle input change
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to submit a form');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/forms/${templateId}/submit`, {
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
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!template) {
        return <div>Loading template...</div>;
    }

    return (
        <div>
            <h1>Fill Out Form: {template.title}</h1>
            <form onSubmit={handleSubmit}>
                {/* String Questions */}
                {template.custom_string1_state && (
                    <div>
                        <label>{template.custom_string1_question}</label>
                        <input
                            type="text"
                            name="string1_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_string2_state && (
                    <div>
                        <label>{template.custom_string2_question}</label>
                        <input
                            type="text"
                            name="string2_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_string3_state && (
                    <div>
                        <label>{template.custom_string3_question}</label>
                        <input
                            type="text"
                            name="string3_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_string4_state && (
                    <div>
                        <label>{template.custom_string4_question}</label>
                        <input
                            type="text"
                            name="string4_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}

                {/* Multi-line Text Questions */}
                {template.custom_multiline1_state && (
                    <div>
                        <label>{template.custom_multiline1_question}</label>
                        <textarea
                            name="multiline1_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_multiline2_state && (
                    <div>
                        <label>{template.custom_multiline2_question}</label>
                        <textarea
                            name="multiline1_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_multiline3_state && (
                    <div>
                        <label>{template.custom_multiline3_question}</label>
                        <textarea
                            name="multiline1_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_multiline4_state && (
                    <div>
                        <label>{template.custom_multiline4_question}</label>
                        <textarea
                            name="multiline1_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}

                {/* Integer Questions */}
                {template.custom_int1_state && (
                    <div>
                        <label>{template.custom_int1_question}</label>
                        <input
                            type="number"
                            name="int1_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_int2_state && (
                    <div>
                        <label>{template.custom_int2_question}</label>
                        <input
                            type="number"
                            name="int2_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_int3_state && (
                    <div>
                        <label>{template.custom_int3_question}</label>
                        <input
                            type="number"
                            name="int3_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_int4_state && (
                    <div>
                        <label>{template.custom_int4_question}</label>
                        <input
                            type="number"
                            name="int4_answer"
                            onChange={handleChange}
                        />
                    </div>
                )}

                {/* Checkbox Questions */}
                {template.custom_checkbox1_state && (
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="checkbox1_answer"
                                onChange={handleChange}
                            />
                            {template.custom_checkbox1_question}
                        </label>
                    </div>
                )}
                {template.custom_checkbox2_state && (
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="checkbox2_answer"
                                onChange={handleChange}
                            />
                            {template.custom_checkbox2_question}
                        </label>
                    </div>
                )}
                {template.custom_checkbox3_state && (
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="checkbox3_answer"
                                onChange={handleChange}
                            />
                            {template.custom_checkbox3_question}
                        </label>
                    </div>
                )}
                {template.custom_checkbox4_state && (
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="checkbox4_answer"
                                onChange={handleChange}
                            />
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