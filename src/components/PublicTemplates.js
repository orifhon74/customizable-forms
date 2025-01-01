import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function PublicTemplates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token');

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

    const handleLike = async (templateId) => {
        if (!isAuthenticated) {
            setError('You must be logged in to like a template');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5001/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ template_id: templateId }),
            });
            if (!response.ok) throw new Error('Failed to like template');
            const updatedTemplates = templates.map((template) =>
                template.id === templateId
                    ? { ...template, likeCount: (template.likeCount || 0) + 1 }
                    : template
            );
            setTemplates(updatedTemplates);
        } catch (err) {
            setError(err.message);
        }
    };

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
                    <p>Likes: {template.likeCount || 0}</p>
                    <button onClick={() => handleLike(template.id)}>Like</button>
                    <Link to={`/template/${template.id}`}>
                        <button>View Details</button>
                    </Link>
                    {isAuthenticated && (
                        <Link to={`/submit-form/${template.id}`}>
                            <button>Fill Out</button>
                        </Link>
                    )}
                    <div>
                        <h4>Tags:</h4>
                        <ul>
                            {template.Tags?.map((tag) => (
                                <li key={tag.id}>{tag.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PublicTemplates;