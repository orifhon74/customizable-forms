import React, {useState, useEffect, useContext} from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import {LanguageContext} from "../context/LanguageContext";


function PublicTemplates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token');

    const API_URL = process.env.REACT_APP_API_URL;

    const { theme } = useContext(ThemeContext);
    const { t } = useContext(LanguageContext);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch(`${API_URL}/api/templates/public`);
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
            const response = await fetch(`${API_URL}/api/likes`, {
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
        <Container className="my-4">
            <h1 className="text-center mb-4">{t('publicTemplates')}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {templates.length === 0 ? (
                <Alert variant="info" className="text-center">
                    No public templates available at the moment.
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {templates.map((template) => (
                        <Col key={template.id}>
                            <Card
                                className="shadow-sm"
                                style={{
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
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
                                            backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa',
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            height: '150px',
                                            backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa',
                                            color: theme === 'dark' ? '#adb5bd' : '#6c757d',
                                            fontStyle: 'italic',
                                        }}
                                    >
                                        No Image
                                    </div>
                                )}
                                <Card.Body>
                                    <Card.Title>{template.title}</Card.Title>
                                    <Card.Text className="text-truncate" style={{ maxHeight: '40px' }}>
                                        {template.description}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Author:</strong> {template.User?.username ?? 'Unknown'}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Likes:</strong> {template.likeCount || 0}
                                    </Card.Text>
                                    <div className="d-flex justify-content-between mb-3">
                                        <Button
                                            onClick={() => handleLike(template.id)}
                                            style={{
                                                backgroundColor: '#007bff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            title="Like this template"
                                        >
                                                <span
                                                    role="img"
                                                    aria-label="thumbs up"
                                                    style={{ fontSize: '1.2rem' }}
                                                >
                                                    👍
                                                </span>
                                        </Button>
                                        <Link to={`/templates/${template.id}`}>
                                            <Button variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}>
                                                {t('viewDetails')}
                                            </Button>
                                        </Link>
                                    </div>
                                    {isAuthenticated && (
                                        <Link to={`/submit-form/${template.id}`}>
                                            <Button variant={theme === 'dark' ? 'success' : 'success'} className="w-100">
                                                Fill Out
                                            </Button>
                                        </Link>
                                    )}
                                    {template.Tags?.length > 0 && (
                                        <div className="mt-3">
                                            <h6>Tags:</h6>
                                            <div>
                                                {template.Tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        bg={theme === 'dark' ? 'dark' : 'secondary'}
                                                        className="me-1"
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}

export default PublicTemplates;