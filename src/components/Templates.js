import React, { useEffect, useState } from 'react';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const response = await fetch('http://localhost:5001/api/templates', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Fetched templates:', data);
                setTemplates(data);
            } catch (err) {
                console.error('Error fetching templates:', err.message);
                setError(err.message);
            }
        };

        fetchTemplates();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Templates</h1>
            {templates.length === 0 ? (
                <p>No templates available.</p>
            ) : (
                <ul>
                    {templates.map((template) => (
                        <li key={template.id}>
                            <strong>{template.title}</strong> - {template.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Templates;