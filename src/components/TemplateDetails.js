import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TemplateDetails() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const isAdmin = JSON.parse(localStorage.getItem('user'))?.role === 'admin';

    useEffect(() => {
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
        fetchTemplate();
    }, [id]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/templates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete template');
            navigate('/templates');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (templateId) => {
        console.log(`Editing template with ID: ${templateId}`);
        navigate(`/create-template?edit=true&templateId=${templateId}`);
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
            {(isAdmin || isOwner) && (
                <div>
                    <button onClick={() => handleEdit(template.id)}>Edit Template</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    );
}

export default TemplateDetails;