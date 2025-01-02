import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Button, Alert, Spinner } from 'react-bootstrap';


function FormDetails() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // User details
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');
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
    }, [formId]);

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
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <strong>Template:</strong> {form.Template?.title || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Submitted By:</strong> {form.User?.username || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Date Submitted:</strong> {new Date(form.createdAt).toLocaleDateString()}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <h2>Answers</h2>
                    <ListGroup>
                        {Object.keys(form)
                            .filter((key) => key.includes('_answer') && form[key])
                            .map((key) => {
                                const questionKey = key.replace('_answer', '_question');
                                const question = form.Template[questionKey];
                                return (
                                    <ListGroup.Item key={key}>
                                        <strong>{question || key.replace('_answer', '')}:</strong>{' '}
                                        {typeof form[key] === 'boolean'
                                            ? form[key]
                                                ? 'Yes'
                                                : 'No'
                                            : form[key]}
                                    </ListGroup.Item>
                                );
                            })}
                    </ListGroup>
                </Col>
            </Row>

            {/* Edit and Delete buttons for admins or the template owner */}
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