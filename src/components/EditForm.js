// src/components/EditForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditForm() {
    const { formId } = useParams();
    const [form, setForm] = useState({});
    const [template, setTemplate] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFormAndTemplate = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetch form details
                const formResp = await fetch(`${API_URL}/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!formResp.ok) throw new Error('Failed to fetch form for editing');
                const formData = await formResp.json();
                setForm(formData);

                // Fetch corresponding template
                const templateResp = await fetch(`${API_URL}/api/templates/${formData.template_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!templateResp.ok) throw new Error('Failed to fetch template for form');
                const templateData = await templateResp.json();
                setTemplate(templateData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFormAndTemplate();
    }, [formId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            if (!response.ok) throw new Error('Failed to update form');
            setSuccess('Form updated successfully!');
            navigate(-1); // Go back
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!form || Object.keys(form).length === 0 || !template) {
        return <div>Loading form...</div>;
    }

    return (
        <div style={{ margin: '20px' }}>
            <h1>Edit Form</h1>
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSubmit}>
                {Object.keys(form)
                    .filter((key) => key.includes('_answer')) // Only show answer fields
                    .map((key) => {
                        const questionKey = key.replace('_answer', '_question');
                        const question = template[questionKey];
                        if (!question) return null; // skip if template doesn't define that question
                        return (
                            <div key={key}>
                                <label>
                                    {question}:
                                    <input
                                        type="text"
                                        name={key}
                                        value={form[key] || ''}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                        );
                    })}
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}

export default EditForm;