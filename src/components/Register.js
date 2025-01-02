import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            if (!response.ok) {
                throw new Error('Failed to register. Please try again.');
            }
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                backgroundColor: 'var(--bs-body-bg)',
                color: 'var(--bs-body-color)',
            }}
        >
            <Card
                className="shadow-lg p-4"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'var(--bs-card-bg)',
                    color: 'var(--bs-body-color)',
                }}
            >
                <Card.Body>
                    <h1 className="text-center mb-4">Register</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button type="submit" className="w-100" variant="primary">
                            Sign Up
                        </Button>
                        <div className="text-center mt-3">
                            <p>
                                Already have an account?{' '}
                                <Button
                                    variant="link"
                                    onClick={() => navigate('/login')}
                                    style={{
                                        padding: 0,
                                        textDecoration: 'none',
                                        color: 'var(--bs-primary)',
                                    }}
                                >
                                    Log In
                                </Button>
                            </p>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register;