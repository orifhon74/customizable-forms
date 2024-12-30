// src/components/PublicTemplates.js
import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function PublicTemplates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublic = async () => {
            try {
                const resp = await fetch('http://localhost:5001/api/templates/public');
                if (!resp.ok) throw new Error('Failed to fetch public templates');
                const data = await resp.json();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchPublic();
    }, []);

    if (error) {
        return <Alert variant="danger">Error: {error}</Alert>;
    }

    return (
        <div>
            <h1>Public Templates</h1>
            <Row>
                {templates.map((tmpl) => (
                    <Col md={4} className="mb-4" key={tmpl.id}>
                        <Card>
                            {tmpl.image_url && (
                                <Card.Img variant="top" src={tmpl.image_url} alt="Template" />
                            )}
                            <Card.Body>
                                <Card.Title>{tmpl.title}</Card.Title>
                                <Card.Text>{tmpl.description}</Card.Text>
                                <Link to={`/submit-form/${tmpl.id}`}>
                                    <Button variant="primary">Fill Out</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default PublicTemplates;