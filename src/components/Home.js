// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAuthenticated = !!token;
    const isAdmin = user.role === 'admin';

    const [latestTemplates, setLatestTemplates] = useState([]);
    const [topTemplates, setTopTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // fetch latest
                let resp = await fetch('http://localhost:5001/api/templates/latest');
                if (!resp.ok) throw new Error('Failed to fetch latest templates');
                let data = await resp.json();
                setLatestTemplates(data);

                // fetch top 5
                resp = await fetch('http://localhost:5001/api/templates/top');
                if (!resp.ok) throw new Error('Failed to fetch top templates');
                data = await resp.json();
                setTopTemplates(data);

                // fetch tag cloud
                resp = await fetch('http://localhost:5001/api/tags/cloud');
                if (!resp.ok) throw new Error('Failed to fetch tag cloud');
                data = await resp.json();
                setTags(data);

            } catch (err) {
                setError(err.message);
            }
        };
        fetchHomeData();
    }, []);

    const handleTagClick = (tagName) => {
        navigate(`/search-results?q=${tagName}`);
    };

    return (
        <Container className="mt-3">
            {error && <Alert variant="danger">{error}</Alert>}

            {isAuthenticated && (
                <div className="d-flex justify-content-end mb-3">
                    <span className="me-3">Signed in as: {user.username}</span>
                    {isAdmin && (
                        <Button
                            as={Link}
                            to="/admin"
                            variant="warning"
                            className="me-2"
                        >
                            Admin Dashboard
                        </Button>
                    )}
                    <Button
                        as={Link}
                        to="/dashboard"
                        variant="info"
                        className="me-2"
                    >
                        My Dashboard
                    </Button>
                </div>
            )}

            <h2>Latest Templates</h2>
            <Row>
                {latestTemplates.map((tmpl) => (
                    <Col md={4} key={tmpl.id} className="mb-4">
                        <Card>
                            {tmpl.image_url && (
                                <Card.Img
                                    variant="top"
                                    src={tmpl.image_url}
                                    alt="Template"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>{tmpl.title}</Card.Title>
                                <Card.Text>{tmpl.description}</Card.Text>
                                <p className="text-muted">Author ID: {tmpl.user_id}</p>
                                <Button as={Link} to={`/submit-form/${tmpl.id}`} variant="primary">
                                    Fill Out
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <h2 className="mt-5">Top 5 Most Popular</h2>
            <Row>
                {topTemplates.map((tmpl) => (
                    <Col md={4} key={tmpl.id} className="mb-4">
                        <Card>
                            {tmpl.image_url && (
                                <Card.Img
                                    variant="top"
                                    src={tmpl.image_url}
                                    alt="Template"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>{tmpl.title}</Card.Title>
                                <Card.Text>{tmpl.description}</Card.Text>
                                <p><strong>Forms filled:</strong> {tmpl.forms_count}</p>
                                <Button as={Link} to={`/submit-form/${tmpl.id}`} variant="primary">
                                    Fill Out
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <h2 className="mt-5">Tag Cloud</h2>
            <div>
                {tags.map((tagObj) => (
                    <Badge
                        key={tagObj.name}
                        bg="info"
                        pill
                        className="me-2 mb-2"
                        style={{ cursor: 'pointer', fontSize: (12 + tagObj.count) + 'px' }}
                        onClick={() => handleTagClick(tagObj.name)}
                    >
                        {tagObj.name}
                    </Badge>
                ))}
            </div>
        </Container>
    );
}

export default Home;