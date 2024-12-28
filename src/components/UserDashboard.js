// src/components/UserDashboard.js
import React, { useState, useEffect } from 'react';

function UserDashboard() {
    const [templates, setTemplates] = useState([]);
    const [forms, setForms] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/templates', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch templates');
                const data = await response.json();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchForms = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/forms', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch forms');
                const data = await response.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplates();
        fetchForms();
    }, []);

    return (
        <div style={{ margin: '20px' }}>
            <h1>User Dashboard</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Your Templates</h2>
            <ul>
                {templates.map((template) => (
                    <li key={template.id}>{template.title}</li>
                ))}
            </ul>

            <h2>Your Forms</h2>
            <ul>
                {forms.map((form) => (
                    <li key={form.id}>Form ID: {form.id}</li>
                ))}
            </ul>
        </div>
    );
}

export default UserDashboard;