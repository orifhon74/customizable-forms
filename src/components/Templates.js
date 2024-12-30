// src/components/Templates.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Row, Col } from 'react-bootstrap';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forms, setForms] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!token) {
            navigate('/sign-in');
            return;
        }

        const fetchTemplates = async () => {
            try {
                const resp = await fetch('http://localhost:5001/api/templates', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) throw new Error('Failed to fetch templates');
                const data = await resp.json();
                setTemplates(data);

                // If route param "id" is set, find that template
                if (id) {
                    const found = data.find((t) => t.id === parseInt(id));
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
            try {
                const resp = await fetch(`http://localhost:5001/api/templates/${templateId}/forms`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) throw new Error('Failed to fetch forms');
                const data = await resp.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplates();
    }, [id, token, navigate]);

    const handleDeleteTemplate = async (templateId) => {
        try {
            const resp = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!resp.ok) throw new Error('Failed to delete template');
            setTemplates((prev) => prev.filter((t) => t.id !== templateId));
            if (templateId === parseInt(id)) {
                navigate('/templates');
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleDeleteForm = async (formId) => {
        try {
            const resp = await fetch(`http://localhost:5001/api/forms/${formId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!resp.ok) throw new Error('Failed to delete form');
            setForms((prev) => prev.filter((f) => f.id !== formId));
        } catch (err) {
            console.error(err.message);
        }
    };

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="container mt-3">
            {!id ? (
                <>
                    <h1>Your Templates</h1>
                    <Row>
                        {templates.map((tmpl) => (
                            <Col md={4} key={tmpl.id} className="mb-3">
                                <Card>
                                    {tmpl.image_url && (
                                        <Card.Img variant="top" src={tmpl.image_url} style={{ objectFit: 'cover', height: '200px' }} />
                                    )}
                                    <Card.Body>
                                        <Card.Title>{tmpl.title}</Card.Title>
                                        <Card.Text>{tmpl.description}</Card.Text>
                                        <Button
                                            onClick={() => navigate(`/templates/${tmpl.id}`)}
                                            variant="primary"
                                            className="me-2"
                                        >
                                            View Details
                                        </Button>
                                        {(isAdmin || user.id === tmpl.user_id) && (
                                            <>
                                                <Button
                                                    onClick={() => navigate(`/create-template?edit=true&templateId=${tmpl.id}`)}
                                                    variant="secondary"
                                                    className="me-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button variant="danger" onClick={() => handleDeleteTemplate(tmpl.id)}>
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            ) : selectedTemplate ? (
                <div>
                    <h1>{selectedTemplate.title}</h1>
                    <p>{selectedTemplate.description}</p>
                    {selectedTemplate.image_url && (
                        <img src={selectedTemplate.image_url} alt="Template" style={{ maxWidth: '400px' }} />
                    )}
                    <p><strong>Topic:</strong> {selectedTemplate.topic}</p>
                    <p><strong>Access:</strong> {selectedTemplate.access_type}</p>

                    {(isAdmin || user.id === selectedTemplate.user_id) && (
                        <>
                            <Button
                                onClick={() => navigate(`/create-template?edit=true&templateId=${selectedTemplate.id}`)}
                                variant="secondary"
                                className="me-2"
                            >
                                Edit Template
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                            >
                                Delete Template
                            </Button>
                        </>
                    )}
                    <Button variant="outline-primary" className="ms-2" onClick={() => navigate('/templates')}>
                        Back to Templates
                    </Button>

                    <hr />
                    <h2>Submitted Forms</h2>
                    {forms.length === 0 ? (
                        <Alert variant="info">No forms have been submitted yet.</Alert>
                    ) : (
                        <ul>
                            {forms.map((f) => (
                                <li key={f.id} className="mb-3">
                                    <p><strong>User ID:</strong> {f.user_id}</p>
                                    <strong>Answers:</strong>
                                    <ul>
                                        {Object.keys(f)
                                            .filter((k) => k.includes('_answer') && f[k])
                                            .map((key) => {
                                                // "string1_answer" => "string1_question"
                                                const questionKey = key.replace('_answer', '_question');
                                                const question = selectedTemplate[questionKey];
                                                const val = typeof f[key] === 'boolean'
                                                    ? f[key] ? 'Yes' : 'No'
                                                    : f[key];
                                                return (
                                                    <li key={key}>
                                                        <strong>{question || key}:</strong> {val}
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                    {(isAdmin || user.id === selectedTemplate.user_id) && (
                                        <>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`/edit-form/${f.id}`)}
                                            >
                                                Edit Form
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteForm(f.id)}
                                            >
                                                Delete Form
                                            </Button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <Alert variant="info">Loading template...</Alert>
            )}
        </div>
    );
}

export default Templates;