// src/components/Forms.js

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Table,
    Alert,
    Button,
    Spinner
} from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext'; // If you want to read the theme

function Forms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { theme } = useContext(ThemeContext); // read the theme ("light" or "dark")
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');

                const response = await fetch(`${API_URL}/api/forms`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchForms();
    }, [API_URL]);

    if (loading) {
        return (
            <Container
                className={`d-flex justify-content-center align-items-center vh-100 ${
                    theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
                }`}
            >
                <Spinner animation="border" />
                <p className="ms-3">Loading forms...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                className={`mt-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}
            >
                <Alert variant="danger">Error: {error}</Alert>
            </Container>
        );
    }

    return (
        <Container
            className={`my-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}
        >
            <h1 className="text-center mb-4">Submitted Forms</h1>
            {forms.length === 0 ? (
                <Alert
                    variant={theme === 'dark' ? 'dark' : 'info'}
                    className="text-center"
                >
                    No forms have been submitted yet.
                </Alert>
            ) : (
                <Table
                    responsive
                    bordered
                    hover
                    className="shadow-sm"
                    /* We do these className conditionally for text color & bg */
                    variant={theme === 'dark' ? 'dark' : undefined}
                    /* If you want striping only in light mode, you could do:
                       striped={theme !== 'dark'}
                    */
                >
                    <thead>
                    <tr>
                        <th>Template</th>
                        <th>Submitted By</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {forms.map((form) => (
                        <tr key={form.id}>
                            <td>{form.Template?.title || 'N/A'}</td>
                            <td>{form.User?.username || 'N/A'}</td>
                            <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button
                                    as={Link}
                                    to={`/forms/${form.id}`}
                                    variant={theme === 'dark' ? 'outline-light' : 'primary'}
                                    size="sm"
                                >
                                    View Form
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default Forms;