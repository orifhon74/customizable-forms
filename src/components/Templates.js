import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forms, setForms] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const userRole = user?.role;
    const userId = user?.id;

    useEffect(() => {
        const fetchTemplatesAndForms = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Unauthorized: No token found');
                return;
            }

            try {
                const response = await fetch('http://localhost:5001/api/templates', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch templates');

                const data = await response.json();

                if (userRole === 'admin') {
                    setTemplates(data);
                } else {
                    const userTemplates = data.filter((template) => template.user_id === userId);
                    setTemplates(userTemplates);
                }

                if (id) {
                    const foundTemplate = data.find((template) => template.id === parseInt(id));
                    if (foundTemplate) {
                        setSelectedTemplate(foundTemplate);
                        await fetchForms(foundTemplate.id);
                        await fetchStats(foundTemplate.id);
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

        const fetchStats = async (templateId) => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(
                    `http://localhost:5001/api/aggregator/${templateId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplatesAndForms();
    }, [id, userRole, userId]);

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
                            {template.image_url && (
                                <img
                                    src={template.image_url}
                                    alt={template.title}
                                    style={{ width: '20%', height: '150px' }}
                                />
                            )}
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

                    <h2>Statistics</h2>
                    {stats ? (
                        <div>
                            <p>Total Forms Submitted: {stats.total_forms || 0}</p>
                            <h4>Averages:</h4>
                            <ul>
                                {stats.averages &&
                                    Object.entries(stats.averages)
                                        .filter(([key]) => {
                                            // Only include fields with corresponding questions
                                            const questionKey = key.replace('_answer', '_question');
                                            return selectedTemplate[questionKey];
                                        })
                                        .map(([key, value]) => {
                                            const questionKey = key.replace('_answer', '_question');
                                            const question = selectedTemplate[questionKey];
                                            return (
                                                <li key={key}>
                                                    <strong>{question}:</strong> {value ? value.toFixed(2) : 0}
                                                </li>
                                            );
                                        })}
                            </ul>
                            <h4>Most Common Answers:</h4>
                            <ul>
                                {stats.commonStrings &&
                                    Object.entries(stats.commonStrings)
                                        .filter(([key]) => {
                                            // Only include fields with corresponding questions
                                            const questionKey = key.replace('_answer', '_question');
                                            return selectedTemplate[questionKey];
                                        })
                                        .map(([key, value]) => {
                                            const questionKey = key.replace('_answer', '_question');
                                            const question = selectedTemplate[questionKey];
                                            return (
                                                <li key={key}>
                                                    <strong>{question}:</strong> {value || 'None'}
                                                </li>
                                            );
                                        })}
                            </ul>
                        </div>
                    ) : (
                        <p>Loading statistics...</p>
                    )}

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