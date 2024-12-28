// src/components/Templates.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forms, setForms] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

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

                if (id) {
                    const found = data.find((template) => template.id === parseInt(id));
                    if (found) {
                        setSelectedTemplate(found);
                        fetchForms(found.id);
                    } else {
                        setError('Template not found');
                    }
                }
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchForms = async (templateId) => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(
                    `http://localhost:5001/api/forms/template/${templateId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch forms');
                const data = await response.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplates();
    }, [id]);

    const handleDeleteTemplate = async (templateId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete template');
            setTemplates((prev) => prev.filter((t) => t.id !== templateId));
            if (templateId === parseInt(id)) {
                navigate('/templates');
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleEditTemplate = (templateId) => {
        navigate(`/create-template?edit=true&templateId=${templateId}`);
    };

    const handleDeleteForm = async (formId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/forms/${formId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete form');
            setForms((prev) => prev.filter((f) => f.id !== formId));
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleEditForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ margin: '20px' }}>
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
                            <button onClick={() => handleEditTemplate(template.id)}>Edit Template</button>
                            <button onClick={() => handleDeleteTemplate(template.id)}>Delete Template</button>
                        </div>
                    ))}
                </div>
            ) : selectedTemplate ? (
                <div style={{ border: '1px solid gray', padding: '20px', marginTop: '20px' }}>
                    <h1>{selectedTemplate.title}</h1>
                    <p>{selectedTemplate.description}</p>
                    <p>Access Type: {selectedTemplate.access_type}</p>
                    {(isAdmin || user?.id === selectedTemplate.user_id) && (
                        <>
                            <button onClick={() => handleEditTemplate(selectedTemplate.id)}>Edit Template</button>
                            <button onClick={() => handleDeleteTemplate(selectedTemplate.id)}>Delete Template</button>
                        </>
                    )}
                    <button onClick={() => navigate('/templates')}>Back to Templates</button>

                    <h2>Submitted Forms</h2>
                    {forms.length === 0 ? (
                        <p>No forms have been submitted yet.</p>
                    ) : (
                        <ul>
                            {forms.map((form) => (
                                <li key={form.id}>
                                    <p>
                                        <strong>Submitted by User ID:</strong> {form.user_id}
                                    </p>
                                    <p>
                                        <strong>Answers:</strong>
                                    </p>
                                    <ul>
                                        {Object.keys(form)
                                            .filter((key) => key.includes('_answer') && form[key])
                                            .map((key) => {
                                                const questionKey = key.replace('_answer', '_question');
                                                const question = selectedTemplate[questionKey];
                                                return (
                                                    <li key={key}>
                                                        <strong>{question || key.replace('_answer', '')}:</strong>{' '}
                                                        {typeof form[key] === 'boolean'
                                                            ? form[key]
                                                                ? 'Yes'
                                                                : 'No'
                                                            : form[key]}
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                    {(isAdmin || user?.id === selectedTemplate.user_id) && (
                                        <>
                                            <button onClick={() => handleEditForm(form.id)}>Edit Form</button>
                                            <button onClick={() => handleDeleteForm(form.id)}>Delete Form</button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div>Loading template...</div>
            )}
        </div>
    );
}

export default Templates;