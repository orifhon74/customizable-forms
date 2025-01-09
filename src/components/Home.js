import React, {useContext, useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import {LanguageContext} from "../context/LanguageContext";


function Home() {
    const [latestTemplates, setLatestTemplates] = useState([]);
    const [topTemplates, setTopTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);

    const [templates, setTemplates] = useState([]);
    const isAuthenticated = !!localStorage.getItem('token');

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const { theme } = useContext(ThemeContext);
    const { t } = useContext(LanguageContext);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Fetch latest templates
                let resp = await fetch(`${API_URL}/api/templates/latest`);
                if (!resp.ok) throw new Error('Failed to fetch latest templates');
                let data = await resp.json();
                setLatestTemplates(data);

                // Fetch top 5 templates
                resp = await fetch(`${API_URL}/api/templates/top`);
                if (!resp.ok) throw new Error('Failed to fetch top templates');
                data = await resp.json();
                setTopTemplates(data);

                // Fetch tag cloud
                resp = await fetch(`${API_URL}/api/tags/cloud`);
                if (!resp.ok) throw new Error('Failed to fetch tag cloud');
                data = await resp.json();
                setTags(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchHomeData();
    }, []);

    const handleTagClick = (tagId) => {
        navigate(`/search-results?q=${tagId}&type=tag`);
    };

    const handleLike = async (templateId, isFromLatest) => {
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

            // Update the likes count in the state
            if (isFromLatest) {
                setLatestTemplates((prevTemplates) =>
                    prevTemplates.map((template) =>
                        template.id === templateId
                            ? { ...template, likeCount: (template.likeCount || 0) + 1 }
                            : template
                    )
                );
            } else {
                setTopTemplates((prevTemplates) =>
                    prevTemplates.map((template) =>
                        template.id === templateId
                            ? { ...template, likeCount: (template.likeCount || 0) + 1 }
                            : template
                    )
                );
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="my-4">
            <h1 className="text-center mb-5">{t('welcome')}</h1>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Latest Templates */}
            <section className="mb-5">
                <h2 className="mb-4 text-center">{t('latestTemplates')}</h2>
                {latestTemplates.length === 0 ? (
                    <p className="text-center">No latest templates available.</p>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {latestTemplates.map((template) => (
                            <Col key={template.id}>
                                <Card
                                    className={`shadow-sm ${
                                        theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
                                    }`}
                                    style={{ height: '100%' }}
                                >
                                    {template.image_url ? (
                                        <Card.Img
                                            variant="top"
                                            src={template.image_url}
                                            alt={template.title}
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                height: '150px',
                                                backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#6c757d',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            No Image
                                        </div>
                                    )}
                                    <Card.Body style={{ display: 'flex', flexDirection: 'column' }}>
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
                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                            <Button
                                                onClick={() => handleLike(template.id, true)}
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
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => navigate(`/templates/${template.id}`)}
                                            >
                                                {t('viewDetails')}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </section>

            {/* Top Templates */}
            <section className="mb-5">
                <h2 className="mb-4 text-center">{t('top5Templates')}</h2>
                {topTemplates.length === 0 ? (
                    <p className="text-center">No top templates available.</p>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {topTemplates.map((template) => (
                            <Col key={template.id}>
                                <Card
                                    className={`shadow-sm ${
                                        theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
                                    }`}
                                    style={{ height: '100%' }}
                                >
                                    {template.image_url ? (
                                        <Card.Img
                                            variant="top"
                                            src={template.image_url}
                                            alt={template.title}
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                height: '150px',
                                                backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#6c757d',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            No Image
                                        </div>
                                    )}
                                    <Card.Body style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Card.Title>{template.title}</Card.Title>
                                        <Card.Text className="text-truncate" style={{ maxHeight: '40px' }}>
                                            {template.description}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Forms Filled:</strong> {template.forms_count}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Likes:</strong> {template.likeCount || 0}
                                        </Card.Text>
                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                            {/*
                                                Same thumbs-up bubble for the "top templates" section
                                            */}
                                            <Button
                                                onClick={() => handleLike(template.id, false)}
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
                                                <Button variant="outline-secondary">{t('viewDetails')}</Button>
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </section>

            {/* Tag Cloud */}
            <section className="mb-5">
                <h2 className="mb-4 text-center">{t('tags')}</h2>
                <div className="d-flex flex-wrap justify-content-center">
                    {tags.map((tag) => (
                        <Badge
                            key={tag.id}
                            bg={theme === 'dark' ? 'secondary' : 'primary'}
                            className="m-1 p-2"
                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => handleTagClick(tag.id)}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            </section>
        </Container>
    );
}

export default Home;