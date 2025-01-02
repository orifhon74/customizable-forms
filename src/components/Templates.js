import React, {useContext, useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    ListGroup,
    Badge,
    Spinner,
    Table,
    Alert,
} from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';

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

    const API_URL = process.env.REACT_APP_API_URL;
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchTemplatesAndForms = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Unauthorized: No token found');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/templates`, {
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
                    `${API_URL}/api/forms/template/${templateId}`,
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
                    `${API_URL}/api/aggregator/${templateId}`,
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
            const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
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
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
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
        <Container className="my-4">
            {!id ? (
                <>
                    <h1 className="mb-4 text-center">Your Templates</h1>
                    {templates.length === 0 ? (
                        <Alert
                            variant={theme === 'dark' ? 'dark' : 'warning'}
                            className="text-center"
                        >
                            No templates available. Create one to get started!
                        </Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {templates.map((template) => (
                                <Col key={template.id}>
                                    <Card
                                        className="shadow-sm"
                                        style={{
                                            backgroundColor:
                                                theme === 'dark' ? '#343a40' : '#fff',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            border: theme === 'dark'
                                                ? '1px solid #495057'
                                                : '1px solid #dee2e6',
                                        }}
                                    >
                                        {template.image_url ? (
                                            <Card.Img
                                                variant="top"
                                                src={template.image_url}
                                                alt={template.title}
                                                style={{
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    backgroundColor:
                                                        theme === 'dark'
                                                            ? '#495057'
                                                            : '#f8f9fa',
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="d-flex align-items-center justify-content-center"
                                                style={{
                                                    height: '150px',
                                                    backgroundColor:
                                                        theme === 'dark'
                                                            ? '#495057'
                                                            : '#f8f9fa',
                                                    color:
                                                        theme === 'dark'
                                                            ? '#adb5bd'
                                                            : '#6c757d',
                                                    fontStyle: 'italic',
                                                }}
                                            >
                                                No Image
                                            </div>
                                        )}
                                        <Card.Body>
                                            <Card.Title>{template.title}</Card.Title>
                                            <Card.Text className="text-truncate">
                                                {template.description}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between">
                                                <Button
                                                    variant={
                                                        theme === 'dark'
                                                            ? 'outline-light'
                                                            : 'primary'
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/template/${template.id}`
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant={
                                                        theme === 'dark'
                                                            ? 'outline-light'
                                                            : 'outline-secondary'
                                                    }
                                                    onClick={() =>
                                                        handleEditTemplate(
                                                            template.id
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() =>
                                                        handleDeleteTemplate(
                                                            template.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            ) : selectedTemplate ? (
                <Card
                    className="p-4 shadow-sm"
                    style={{
                        backgroundColor:
                            theme === 'dark' ? '#343a40' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#000',
                        border: theme === 'dark'
                            ? '1px solid #495057'
                            : '1px solid #dee2e6',
                    }}
                >
                    <Card.Body>
                        <h1>{selectedTemplate.title}</h1>
                        <p>{selectedTemplate.description}</p>
                        <p>
                            <strong>Access Type:</strong> {selectedTemplate.access_type}
                        </p>
                        <div className="mb-3">
                            {(isAdmin || user?.id === selectedTemplate.user_id) && (
                                <>
                                    <Button
                                        variant={
                                            theme === 'dark'
                                                ? 'outline-light'
                                                : 'outline-secondary'
                                        }
                                        className="me-2"
                                        onClick={() =>
                                            handleEditTemplate(selectedTemplate.id)
                                        }
                                    >
                                        Edit Template
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            handleDeleteTemplate(selectedTemplate.id)
                                        }
                                    >
                                        Delete Template
                                    </Button>
                                </>
                            )}
                            <Button
                                variant={
                                    theme === 'dark'
                                        ? 'outline-primary'
                                        : 'outline-secondary'
                                }
                                onClick={() => navigate('/templates')}
                            >
                                Back to Templates
                            </Button>
                        </div>
                        <h2>Statistics</h2>
                        {stats ? (
                            <div>
                                <p>
                                    <strong>Total Forms Submitted:</strong>{' '}
                                    {stats.total_forms || 0}
                                </p>
                                <h4>Averages</h4>
                                <ListGroup>
                                    {Object.entries(stats.averages).map(
                                        ([key, value]) => (
                                            <ListGroup.Item
                                                key={key}
                                                style={{
                                                    backgroundColor:
                                                        theme === 'dark'
                                                            ? '#495057'
                                                            : '#fff',
                                                    color:
                                                        theme === 'dark'
                                                            ? '#fff'
                                                            : '#000',
                                                }}
                                            >
                                                {key.replace('_answer', '')}: {value.toFixed(2)}
                                            </ListGroup.Item>
                                        )
                                    )}
                                </ListGroup>
                            </div>
                        ) : (
                            <Spinner animation="border" />
                        )}

                        <h2>Submitted Forms</h2>
                        {forms.length === 0 ? (
                            <Alert
                                variant={theme === 'dark' ? 'dark' : 'info'}
                            >
                                No forms have been submitted yet.
                            </Alert>
                        ) : (
                            <ListGroup>
                                {forms.map((form) => (
                                    <ListGroup.Item
                                        key={form.id}
                                        style={{
                                            backgroundColor: theme === 'dark' ? '#495057' : '#fff',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                        }}
                                    >
                                        <p>
                                            <strong>Submitted by User ID:</strong> {form.user_id}
                                        </p>
                                        <p>
                                            <strong>Answers:</strong>
                                        </p>
                                        <ul>
                                            {Object.keys(form)
                                                .filter((key) => key.includes('_answer') && form[key]) // Ensure the answer exists
                                                .map((key) => {
                                                    if (!selectedTemplate) {
                                                        console.error(
                                                            `selectedTemplate is null or undefined for form:`,
                                                            form
                                                        );
                                                        return null;
                                                    }

                                                    const questionKey = key.replace('_answer', '_question');
                                                    const question = selectedTemplate[questionKey];

                                                    if (!question) {
                                                        console.warn(
                                                            `Question for key "${questionKey}" not found in selectedTemplate:`,
                                                            selectedTemplate
                                                        );
                                                        return null;
                                                    }

                                                    return (
                                                        <li key={key}>
                                                            <strong>{question}:</strong>{' '}
                                                            {typeof form[key] === 'boolean'
                                                                ? form[key]
                                                                    ? 'Yes'
                                                                    : 'No'
                                                                : form[key]}
                                                        </li>
                                                    );
                                                })}
                                        </ul>
                                        {(isAdmin || user?.id === selectedTemplate?.user_id) && (
                                            <div className="mt-2 d-flex">
                                                <Button
                                                    variant={
                                                        theme === 'dark'
                                                            ? 'outline-light'
                                                            : 'outline-secondary'
                                                    }
                                                    className="me-2"
                                                    onClick={() => handleEditForm(form.id)}
                                                >
                                                    Edit Form
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteForm(form.id)}
                                                >
                                                    Delete Form
                                                </Button>
                                            </div>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>
            ) : (
                <Spinner animation="border" />
            )}
        </Container>
    );
}

export default Templates;