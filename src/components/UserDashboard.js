// src/components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';


function UserDashboard() {
    const [templates, setTemplates] = useState([]);
    const [forms, setForms] = useState([]);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchTemplates = async () => {
            try {
                const response = await fetch(`${API_URL}/api/templates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch templates');
                const data = await response.json();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchForms = async () => {
            try {
                const response = await fetch(`${API_URL}/api/forms`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch forms');
                const data = await response.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTemplates();
        fetchForms();
    }, []);

    return (
        <Container className="my-4">
            <h1 className="text-center mb-5">User Dashboard</h1>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-5">
                <Col>
                    <h2>Your Templates</h2>
                    {templates.length === 0 ? (
                        <Alert variant="info">You have not created any templates yet.</Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {templates.map((template) => (
                                <Col key={template.id}>
                                    <Card className="shadow-sm">
                                        <Card.Body>
                                            <Card.Title>{template.title}</Card.Title>
                                            <Card.Text>{template.description || 'No description available'}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>

            <Row>
                <Col>
                    <h2>Your Forms</h2>
                    {forms.length === 0 ? (
                        <Alert variant="info">You have not submitted any forms yet.</Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {forms.map((form) => (
                                <Col key={form.id}>
                                    <Card className="shadow-sm">
                                        <Card.Body>
                                            <Card.Title>Form ID: {form.id}</Card.Title>
                                            <Card.Text>
                                                Submitted on: {new Date(form.createdAt).toLocaleDateString()}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default UserDashboard;