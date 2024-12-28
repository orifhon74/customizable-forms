import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TemplateDetails() {
    const { id } = useParams(); // Template ID from route
    const [template, setTemplate] = useState(null);
    const [forms, setForms] = useState([]); // Forms submitted to this template
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const isAdmin = JSON.parse(localStorage.getItem('user'))?.role === 'admin';

    useEffect(() => {
        // Fetch template details
        const fetchTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/templates/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch template');
                const data = await response.json();
                setTemplate(data);
            } catch (err) {
                setError(err.message);
            }
        };

        // Fetch forms submitted to this template
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/forms/template/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch forms');
                const data = await response.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplate();
        fetchForms();
    }, [id]);

    const handleDeleteForm = async (formId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/forms/${formId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete form');
            setForms(forms.filter((form) => form.id !== formId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!template) {
        return <div>Loading template...</div>;
    }

    const isOwner = JSON.parse(localStorage.getItem('user'))?.id === template.user_id;

    return (
        <div>
            <h1>{template.title}</h1>
            <p>{template.description}</p>
            <p>Access Type: {template.access_type}</p>

            <h2>Submitted Forms</h2>
            {forms.length === 0 ? (
                <p>No forms have been submitted yet.</p>
            ) : (
                <ul>
                    {forms.map((form) => (
                        <li key={form.id}>
                            <p>Submitted by User ID: {form.user_id}</p>
                            <button onClick={() => navigate(`/edit-form/${form.id}`)}>Edit</button>
                            <button onClick={() => handleDeleteForm(form.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TemplateDetails;