// src/components/TemplateDetails.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
    Form,
    Badge,
    ListGroup,
} from 'react-bootstrap';
import { LanguageContext } from '../context/LanguageContext';

function TemplateDetails() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);
    const [error, setError] = useState(null);
    const [likeDisabled, setLikeDisabled] = useState(false);
    const [commentContent, setCommentContent] = useState('');

    const API_URL = process.env.REACT_APP_API_URL;
    const { t } = useContext(LanguageContext);

    useEffect(() => {
        const fetchTemplateDetails = async () => {
            try {
                const resp = await fetch(`${API_URL}/api/templates/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!resp.ok) throw new Error('Failed to fetch template details');
                const data = await resp.json();

                setTemplate(data);
                setLikes(data.likeCount || 0);

                // Fetch comments
                const commentsResp = await fetch(`${API_URL}/api/comments/${id}`);
                if (!commentsResp.ok) throw new Error('Failed to fetch comments');
                const commentsData = await commentsResp.json();
                setComments(commentsData);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        };

        fetchTemplateDetails();
    }, [id, API_URL]);

    const handleLike = async () => {
        if (!localStorage.getItem('token')) {
            setError('You must be logged in to like a template.');
            return;
        }

        try {
            setLikeDisabled(true);
            const resp = await fetch(`${API_URL}/api/likes`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ template_id: id }),
            });
            if (!resp.ok) throw new Error('Failed to like template');
            setLikes((prevLikes) => prevLikes + 1);
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        } finally {
            setLikeDisabled(false);
        }
    };

    const handleAddComment = async () => {
        if (!localStorage.getItem('token')) {
            setError('You must be logged in to comment.');
            return;
        }

        if (!commentContent.trim()) {
            setError('Comment content cannot be empty.');
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ template_id: id, content: commentContent }),
            });
            if (!resp.ok) throw new Error('Failed to add comment');
            const newComment = await resp.json();
            setComments((prev) => [newComment, ...prev]);
            setCommentContent('');
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }
    };

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!template) {
        return <div>Loading...</div>;
    }

    return (
        <Container className="my-4">
            <Row>
                <Col md={8}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Card.Title>{template.title}</Card.Title>
                            <Card.Text>{template.description}</Card.Text>
                            <div className="mb-3">
                                <strong>Tags: </strong>
                                {template.Tags?.length > 0 ? (
                                    template.Tags.map((tag) => (
                                        <Badge key={tag.id} bg="secondary" className="me-1">
                                            {tag.name}
                                        </Badge>
                                    ))
                                ) : (
                                    'No tags'
                                )}
                            </div>
                            <div className="d-flex align-items-center">
                                <Button
                                    variant="primary"
                                    onClick={handleLike}
                                    disabled={likeDisabled}
                                    className="me-3"
                                >
                                    {likeDisabled ? 'Liking...' : 'Like'}
                                </Button>
                                <span>Likes: {likes}</span>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* If your backend sends an array of questions in data.Questions: */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Card.Title>{t('questions')}</Card.Title>
                            {template.Questions && template.Questions.length > 0 ? (
                                <ListGroup variant="flush">
                                    {template.Questions.map((q, index) => (
                                        <ListGroup.Item key={index}>
                                            {/*<strong>Type:</strong> {q.question_type} <br />*/}
                                            <strong>Question:</strong> {q.question_text}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="info">No questions available.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Card.Title>{t('comments')}</Card.Title>
                            <ListGroup variant="flush" className="mb-3">
                                {comments.map((comment) => (
                                    <ListGroup.Item key={comment.id}>
                                        <strong>{comment.User?.username || 'Anonymous'}:</strong>{' '}
                                        {comment.content}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <Form>
                                <Form.Group controlId="formComment" className="mb-3">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add a comment"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="primary" onClick={handleAddComment}>
                                    Submit Comment
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default TemplateDetails;