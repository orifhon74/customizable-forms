// src/components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import {LanguageContext} from "../context/LanguageContext";

function Login({ setIsAuthenticated, setUserRole }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const { theme } = useContext(ThemeContext);
    const { t } = useContext(LanguageContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // invalid credentials or user is blocked
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsAuthenticated(true);
            setUserRole(data.user.role);

            navigate(data.user.role === 'admin' ? '/admin' : '/templates');
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
                    <h1 className="text-center mb-4">{t('login')}</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
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
                            {t('login')}
                        </Button>
                        <div className="text-center mt-3">
                            <p>
                                {t('noAccount')}{' '}
                                <Button
                                    variant="link"
                                    onClick={() => navigate('/register')}
                                    style={{
                                        padding: 0,
                                        textDecoration: 'none',
                                        color: 'var(--bs-primary)',
                                    }}
                                >
                                    {t('register')}
                                </Button>
                            </p>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login;