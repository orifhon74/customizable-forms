import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function PublicTemplates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/templates/public');
                if (!response.ok) throw new Error('Failed to fetch public templates');
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
            {templates.map((template) => (
                <div key={template.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                    <h3>{template.title}</h3>
                    <p>{template.description}</p>
                    {isAuthenticated && (
                        <Link to={`/submit-form/${template.id}`}>
                            <button>Fill Out</button>
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
}

export default PublicTemplates;