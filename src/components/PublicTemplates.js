import React, { useEffect, useState } from 'react';

function PublicTemplates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/templates/public');
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

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Public Templates</h1>
            {templates.length === 0 ? (
                <p>No public templates available.</p>
            ) : (
                <ul>
                    {templates.map((template) => (
                        <li key={template.id}>
                            <h3>{template.title}</h3>
                            <p>{template.description}</p>
                            <button onClick={() => window.location.href = `/submit-form/${template.id}`}>
                                Fill Out
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PublicTemplates;