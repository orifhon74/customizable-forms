import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams(); // Get template ID from the URL

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

                // If an ID is present, fetch and display the selected template
                if (id) {
                    const selected = data.find((template) => template.id === parseInt(id));
                    if (selected) {
                        setSelectedTemplate(selected);
                    } else {
                        setError('Template not found');
                    }
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplates();
    }, [id]);

    const handleDelete = async (templateId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete template');

            setTemplates(templates.filter((template) => template.id !== templateId));
            if (templateId === parseInt(id)) {
                navigate('/templates'); // Redirect to the main list if the selected template is deleted
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleEdit = (templateId) => {
        navigate(`/create-template?edit=true&templateId=${templateId}`);
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {!id ? (
                <div>
                    <h1>Your Templates</h1>
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}
                        >
                            <h2>{template.title}</h2>
                            <p>{template.description}</p>
                            <button onClick={() => navigate(`/template/${template.id}`)}>View Details</button>
                            <button onClick={() => handleEdit(template.id)}>Edit Template</button>
                            <button onClick={() => handleDelete(template.id)}>Delete Template</button>
                        </div>
                    ))}
                </div>
            ) : selectedTemplate ? (
                <div style={{ border: '1px solid gray', padding: '20px', marginTop: '20px' }}>
                    <h1>{selectedTemplate.title}</h1>
                    <p>{selectedTemplate.description}</p>
                    <p>Access Type: {selectedTemplate.access_type}</p>
                    <button onClick={() => handleEdit(selectedTemplate.id)}>Edit Template</button>
                    <button onClick={() => handleDelete(selectedTemplate.id)}>Delete Template</button>
                    <button onClick={() => navigate('/templates')}>Back to Templates</button>
                </div>
            ) : (
                <div>Loading template...</div>
            )}
        </div>
    );
}

export default Templates;