import React, { useEffect, useState } from 'react';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            const token = localStorage.getItem('token');
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

        fetchTemplates();
    }, []);

    const handleDelete = async (templateId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete template');

            setTemplates(templates.filter((template) => template.id !== templateId));
        } catch (err) {
            console.error(err.message);
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Your Templates</h1>
            {templates.map((template) => (
                <div key={template.id} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                    <h2>{template.title}</h2>
                    <p>{template.description}</p>
                    <button onClick={() => handleDelete(template.id)}>Delete Template</button>
                    <button>Edit Template</button> {/* Add functionality later */}
                </div>
            ))}
        </div>
    );
}

export default Templates;