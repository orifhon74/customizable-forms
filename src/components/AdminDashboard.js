import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function AdminDashboard() {
    return (
        <Container className="mt-4">
            <h1 className="text-center mb-4">Admin Dashboard</h1>
            <Row className="g-4">
                <Col xs={12} sm={6} md={4}>
                    <Card
                        className="h-100 shadow-sm"
                        bg="dark"
                        text="light"
                        style={{ border: 'none' }}
                    >
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>User Management</Card.Title>
                            <Card.Text>Manage users, roles, and permissions.</Card.Text>
                            <Button
                                as={Link}
                                to="/admin/users"
                                variant="light"
                                className="mt-auto text-dark"
                            >
                                Go to User Management
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Card
                        className="h-100 shadow-sm"
                        bg="dark"
                        text="light"
                        style={{ border: 'none' }}
                    >
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Templates</Card.Title>
                            <Card.Text>
                                View and manage templates created by users.
                            </Card.Text>
                            <Button
                                as={Link}
                                to="/templates"
                                variant="light"
                                className="mt-auto text-dark"
                            >
                                Go to Templates
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Card
                        className="h-100 shadow-sm"
                        bg="dark"
                        text="light"
                        style={{ border: 'none' }}
                    >
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Forms</Card.Title>
                            <Card.Text>Access and manage submitted forms.</Card.Text>
                            <Button
                                as={Link}
                                to="/forms"
                                variant="light"
                                className="mt-auto text-dark"
                            >
                                Go to Forms
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Card
                        className="h-100 shadow-sm"
                        bg="dark"
                        text="light"
                        style={{ border: 'none' }}
                    >
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Create Template</Card.Title>
                            <Card.Text>
                                Create new templates for users to fill out.
                            </Card.Text>
                            <Button
                                as={Link}
                                to="/create-template"
                                variant="light"
                                className="mt-auto text-dark"
                            >
                                Create Template
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AdminDashboard;