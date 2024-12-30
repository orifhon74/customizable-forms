import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AdminDashboard() {
    return (
        <div className="mt-3">
            <h1>Admin Dashboard</h1>
            <Row className="mt-4">
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>User Management</Card.Title>
                            <Card.Text>View, block, unblock, delete users, and manage admin roles.</Card.Text>
                            <Button as={Link} to="/admin/users" variant="primary">
                                Manage Users
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>All Templates</Card.Title>
                            <Card.Text>View or edit any template as admin, see private or public ones.</Card.Text>
                            <Button as={Link} to="/templates" variant="primary">
                                Templates
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>All Forms</Card.Title>
                            <Card.Text>Manage or edit form answers, see all submitted forms.</Card.Text>
                            <Button as={Link} to="/forms" variant="primary">
                                Forms
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashboard;