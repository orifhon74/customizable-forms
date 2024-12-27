import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleFillOut = (templateId) => {
        navigate(`/submit-form/${templateId}`);
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5001/api/templates', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch templates');
                }

                const data = await response.json();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplates();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Templates</h1>
            {templates.map((template) => (
                <div key={template.id}>
                    <h3>{template.title}</h3>
                    <p>{template.description}</p>
                    <button onClick={() => handleFillOut(template.id)}>Fill Out</button>
                </div>
            ))}
        </div>
    );
}

export default Templates;