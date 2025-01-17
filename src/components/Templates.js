// src/components/Templates.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    ListGroup,
    Alert,
    Spinner
} from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forms, setForms] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams();

    // Current user info
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const userRole = user?.role;
    const userId = user?.id;

    // Env / theme
    const API_URL = process.env.REACT_APP_API_URL;
    const { theme } = useContext(ThemeContext);
    const { t } = useContext(LanguageContext);

    useEffect(() => {
        const fetchTemplatesAndStuff = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Unauthorized: No token found');
                return;
            }

            try {
                // 1) Fetch all templates
                const resTemplates = await fetch(`${API_URL}/api/templates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resTemplates.ok) {
                    throw new Error('Failed to fetch templates');
                }
                const dataTemplates = await resTemplates.json();

                // If admin => show all. Else => user-owned
                if (userRole === 'admin') {
                    setTemplates(dataTemplates);
                } else {
                    const userTemplates = dataTemplates.filter(
                        (tpl) => tpl.user_id === userId
                    );
                    setTemplates(userTemplates);
                }

                // 2) If :id param => find that template & fetch forms/stats
                if (id) {
                    const foundTemplate = dataTemplates.find(
                        (tpl) => tpl.id === parseInt(id, 10)
                    );
                    if (!foundTemplate) {
                        setError('Template not found');
                        return;
                    }
                    setSelectedTemplate(foundTemplate);

                    await fetchForms(foundTemplate.id);
                    await fetchStats(foundTemplate.id);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchForms = async (templateId) => {
            try {
                const token = localStorage.getItem('token');
                const resForms = await fetch(
                    `${API_URL}/api/forms/template/${templateId}?includeAnswers=true`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!resForms.ok) {
                    throw new Error('Failed to fetch forms');
                }
                const dataForms = await resForms.json();
                setForms(dataForms);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchStats = async (templateId) => {
            try {
                const token = localStorage.getItem('token');
                const resStats = await fetch(
                    `${API_URL}/api/aggregator/unlimited/${templateId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!resStats.ok) {
                    throw new Error('Failed to fetch aggregator stats');
                }
                const dataStats = await resStats.json();
                setStats(dataStats);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplatesAndStuff();
    }, [id, userRole, userId, API_URL]);

    // ----------------
    // Template actions
    // ----------------
    const handleDeleteTemplate = async (templateId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to delete template');
            }
            setTemplates((prev) => prev.filter((t) => t.id !== templateId));
            if (templateId === parseInt(id, 10)) {
                navigate('/templates');
            }
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }
    };

    const handleEditTemplate = (templateId) => {
        navigate(`/create-template?edit=true&templateId=${templateId}`);
    };

    // -------------
    // Form actions
    // -------------
    const handleDeleteForm = async (formId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to delete form');
            }
            setForms((prev) => prev.filter((f) => f.id !== formId));
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }
    };

    const handleEditForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    // -------------
    // Rendering
    // -------------
    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    // If no ID param => list user’s templates
    if (!id) {
        return (
            <Container className="my-4">
                <h1 className="mb-4 text-center">{t('yourTemplates')}</h1>
                {templates.length === 0 ? (
                    <Alert
                        variant={theme === 'dark' ? 'dark' : 'warning'}
                        className="text-center"
                    >
                        {t('noTemplates')}
                    </Alert>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {templates.map((template) => (
                            <Col key={template.id}>
                                {/*
                  1) Uniform cards
                */}
                                <Card
                                    className="shadow-sm h-100 d-flex flex-column"
                                    style={{
                                        backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                                    }}
                                >
                                    {/*
                    2) Fixed-height image area
                  */}
                                    {template.image_url ? (
                                        <div style={{ height: '180px', overflow: 'hidden' }}>
                                            <Card.Img
                                                variant="top"
                                                src={template.image_url}
                                                alt={template.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa',
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                height: '180px',
                                                backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa',
                                                color: theme === 'dark' ? '#adb5bd' : '#6c757d',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            No Image
                                        </div>
                                    )}

                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title
                                            className="mb-2"
                                            style={{ fontWeight: 600, fontSize: '1.2rem' }}
                                        >
                                            {template.title}
                                        </Card.Title>
                                        <Card.Text className="text-truncate mb-3">
                                            {template.description}
                                        </Card.Text>

                                        {/*
                      3) Minimal button row
                    */}
                                        <div className="mt-auto d-flex justify-content-between">
                                            <Button
                                                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                                                size="sm"
                                                onClick={() => navigate(`/template/${template.id}`)}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </Button>
                                            <Button
                                                variant={theme === 'dark' ? 'outline-light' : 'outline-success'}
                                                size="sm"
                                                onClick={() => handleEditTemplate(template.id)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteTemplate(template.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        );
    }

    // Single template details
    if (!selectedTemplate) {
        return <Spinner animation="border" className="m-4" />;
    }

    return (
        <Container className="my-4">
            <Card
                className="p-4 shadow-sm h-100 d-flex flex-column"
                style={{
                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                }}
            >
                <Card.Body className="d-flex flex-column">
                    <h1 style={{ fontWeight: 600 }}>{selectedTemplate.title}</h1>
                    <p>{selectedTemplate.description}</p>
                    <p>
                        <strong>Access Type:</strong> {selectedTemplate.access_type}
                    </p>

                    {(isAdmin || userId === selectedTemplate.user_id) && (
                        <div className="mb-3">
                            <Button
                                variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                                className="me-2"
                                onClick={() => handleEditTemplate(selectedTemplate.id)}
                            >
                                <i className="bi bi-pencil me-1"></i> Edit Template
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                            >
                                <i className="bi bi-trash me-1"></i> Delete Template
                            </Button>
                        </div>
                    )}

                    <Button
                        variant={theme === 'dark' ? 'outline-primary' : 'outline-secondary'}
                        className="mb-4"
                        onClick={() => navigate('/templates')}
                    >
                        <i className="bi bi-arrow-left-circle me-1"></i> Back to Templates
                    </Button>

                    {/* Stats */}
                    {stats && (
                        <div className="mb-4">
                            <h2 style={{ fontWeight: 600 }}>
                                <i className="bi bi-bar-chart-line me-2"></i> Statistics
                            </h2>
                            <p>
                                <strong>Total Forms Submitted:</strong> {stats.totalForms}
                            </p>

                            {/* Numeric Averages */}
                            {stats.numericAverages && stats.numericAverages.length > 0 && (
                                <>
                                    <h4 className="mt-3" style={{ fontWeight: 500 }}>
                                        Average Values (Numeric Questions)
                                    </h4>
                                    <ul className="ms-3">
                                        {stats.numericAverages.map((item) => (
                                            <li key={item.question_id} className="mb-1">
                                                <strong>{item.question_text}:</strong>{' '}
                                                {item.average !== null ? item.average.toFixed(2) : 'N/A'}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {/* Common Strings */}
                            {stats.commonStrings && stats.commonStrings.length > 0 && (
                                <>
                                    <h4 className="mt-3" style={{ fontWeight: 500 }}>
                                        Most Common Answers (String/Multi-line)
                                    </h4>
                                    <ul className="ms-3">
                                        {stats.commonStrings.map((item) => (
                                            <li key={item.question_id} className="mb-1">
                                                <strong>{item.question_text}:</strong>{' '}
                                                {item.mostCommon || 'N/A'}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {/* Checkbox Stats */}
                            {stats.checkboxStats && stats.checkboxStats.length > 0 && (
                                <>
                                    <h4 className="mt-3" style={{ fontWeight: 500 }}>
                                        Checkbox Statistics
                                    </h4>
                                    <ul className="ms-3">
                                        {stats.checkboxStats.map((item) => (
                                            <li key={item.question_id} className="mb-1">
                                                <strong>{item.question_text}:</strong>{' '}
                                                True: {item.trueCount}, False: {item.falseCount}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}

                    {/* Submitted Forms */}
                    <h2 style={{ fontWeight: 600 }}>Submitted Forms</h2>
                    {forms.length === 0 ? (
                        <Alert
                            variant={theme === 'dark' ? 'dark' : 'info'}
                            className="mt-3"
                        >
                            No forms have been submitted yet.
                        </Alert>
                    ) : (
                        <ListGroup className="mt-3">
                            {forms.map((form) => (
                                <ListGroup.Item
                                    key={form.id}
                                    className="mb-2"
                                    style={{
                                        backgroundColor: theme === 'dark' ? '#495057' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    }}
                                >
                                    <div className="mb-2">
                                        <strong>Form ID:</strong> {form.id} |{' '}
                                        <strong>Submitted by User ID:</strong> {form.user_id}
                                    </div>

                                    {/* If FormAnswers exist */}
                                    {form.FormAnswers && form.FormAnswers.length > 0 && (
                                        <div style={{ marginLeft: '1rem' }}>
                                            <h5>Answers:</h5>
                                            <ul style={{ listStyleType: 'circle' }}>
                                                {form.FormAnswers.map((fa) => {
                                                    let displayVal = fa.answer_value;
                                                    if (fa.Question?.question_type === 'checkbox') {
                                                        displayVal = fa.answer_value === 'true' ? 'Yes' : 'No';
                                                    }
                                                    return (
                                                        <li key={fa.id}>
                                                            <strong>{fa.Question?.question_text}:</strong> {displayVal}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    {(isAdmin || userId === selectedTemplate.user_id) && (
                                        <div className="mt-2 d-flex">
                                            <Button
                                                variant={
                                                    theme === 'dark' ? 'outline-light' : 'outline-secondary'
                                                }
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditForm(form.id)}
                                            >
                                                <i className="bi bi-pencil me-1"></i> Edit Form
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteForm(form.id)}
                                            >
                                                <i className="bi bi-trash me-1"></i> Delete Form
                                            </Button>
                                        </div>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Templates;