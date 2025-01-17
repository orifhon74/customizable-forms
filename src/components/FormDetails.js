// src/components/FormDetails.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    ListGroup,
    Button,
    Alert,
    Spinner
} from 'react-bootstrap';

function FormDetails() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // If user is stored in localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');

                // We'll assume your new unlimited-questions backend includes FormAnswers in the response:
                // GET /api/forms/:id => { ... form data ..., FormAnswers: [ { id, answer_value, Question: {...} }, ... ] }
                const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setForm(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchFormDetails();
    }, [formId, API_URL]);

    const handleEditForm = () => {
        navigate(`/edit-form/${formId}`);
    };

    const handleDeleteForm = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete form');
            navigate('/forms'); // Redirect back to forms page
        } catch (err) {
            console.error(err.message);
            setError('Failed to delete the form.');
        }
    };

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">Error: {error}</Alert>
            </Container>
        );
    }

    if (!form) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
                <p className="ms-3">Loading form details...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h1 className="mb-4">Form Details</h1>
                    <ListGroup variant="flush" className="mb-4">
                        <ListGroup.Item>
                            <strong>Template:</strong> {form.Template?.title || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Submitted By:</strong> {form.User?.username || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Date Submitted:</strong>{' '}
                            {new Date(form.createdAt).toLocaleDateString()}
                        </ListGroup.Item>
                    </ListGroup>

                    <h2>Answers</h2>
                    {form.FormAnswers && form.FormAnswers.length > 0 ? (
                        <ListGroup>
                            {form.FormAnswers.map((fa) => (
                                <ListGroup.Item key={fa.id}>
                                    {/* If your backend includes fa.Question object */}
                                    <strong>
                                        {fa.Question?.question_text || 'Unknown Question'}:
                                    </strong>{' '}
                                    {/* Convert 'true'/'false' string if it's a checkbox */}
                                    {fa.Question?.question_type === 'checkbox'
                                        ? fa.answer_value === 'true'
                                            ? 'Yes'
                                            : 'No'
                                        : fa.answer_value}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <Alert variant="info">No answers found for this form.</Alert>
                    )}
                </Col>
            </Row>

            {(isAdmin || user?.id === form.Template?.user_id) && (
                <Row className="mt-4">
                    <Col className="d-flex justify-content-end">
                        <Button variant="warning" className="me-3" onClick={handleEditForm}>
                            Edit Form
                        </Button>
                        <Button variant="danger" onClick={handleDeleteForm}>
                            Delete Form
                        </Button>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default FormDetails;