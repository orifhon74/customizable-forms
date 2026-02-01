// src/components/TemplateForm.js

import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../firebase'; // Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container,
    Form,
    Button,
    Alert,
    Row,
    Col,
    Badge,
    InputGroup,
    Card,
} from 'react-bootstrap';
import { LanguageContext } from "../context/LanguageContext";

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const isEditMode = queryParams.get('edit') === 'true';
    const templateId = queryParams.get('templateId');

    // Basic fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public');
    const [topic, setTopic] = useState('Other'); // Default to "Other"
    const [imageUrl, setImageUrl] = useState('');

    /**
     * questions: an array of objects [{ question_text, question_type }]
     * Instead of separate arrays for string/multiline/int/checkbox.
     */
    const [questions, setQuestions] = useState([]);

    // Tags
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // UI State
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploading, setUploading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;
    const { t } = useContext(LanguageContext);

    // -----------------------------
    // Tag handlers
    // -----------------------------
    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags((prev) => [...prev, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    };

    // -----------------------------
    // Fetch if editing
    // -----------------------------
    useEffect(() => {
        if (isEditMode && templateId) {
            const fetchTemplate = async () => {
                const token = localStorage.getItem('token');
                if (!token) return;

                try {
                    const resp = await fetch(`${API_URL}/api/templates/${templateId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!resp.ok) throw new Error('Failed to fetch template for editing');

                    const data = await resp.json();

                    // Fill the states
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setAccessType(data.access_type || 'public');
                    setTopic(data.topic_id || 'Other');
                    setImageUrl(data.image_url || '');

                    const normalizedTags =
                        Array.isArray(data.tags) ? data.tags :
                            Array.isArray(data.Tags) ? data.Tags.map(t => t.name) :
                                [];

                    setTags(normalizedTags);

                    // If your backend returns an array of questions under data.Questions:
                    if (data.Questions) {
                        setQuestions(
                            data.Questions.map((q) => ({
                                question_text: q.question_text,
                                question_type: q.question_type,
                            }))
                        );
                    } else {
                        setQuestions([]);
                    }
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchTemplate();
        }
    }, [isEditMode, templateId, API_URL]);

    // -----------------------------
    // Image Upload
    // -----------------------------
    const handleImageUpload = async (e) => {
        const file = e.target?.files?.[0];
        if (!file) {
            setError('No file selected');
            return;
        }
        setError(null);

        const storageRef = ref(storage, `template-images/${Date.now()}-${file.name}`);
        try {
            setUploading(true);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setImageUrl(url);
            setUploading(false);
        } catch (err) {
            setError('Failed to upload image');
            setUploading(false);
        }
    };

    // -----------------------------
    // Unlimited Questions Logic
    // -----------------------------
    const handleAddQuestion = () => {
        // Default question is a single-line
        setQuestions((prev) => [
            ...prev,
            { question_text: '', question_type: 'string' },
        ]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        setQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
        );
    };

    // -----------------------------
    // Submit (create or update)
    // -----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to create or edit a template');
            return;
        }

        const url = isEditMode
            ? `${API_URL}/api/templates/${templateId}`
            : `${API_URL}/api/templates`;
        const method = isEditMode ? 'PUT' : 'POST';

        // Build request body for unlimited questions
        const requestBody = {
            title,
            description,
            access_type: accessType,
            topic_id: topic,
            image_url: imageUrl,
            tags,
            questions, // your dynamic array
        };

        try {
            const resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!resp.ok) {
                const msg = await resp.json();
                throw new Error(
                    msg.error || `Failed to ${isEditMode ? 'update' : 'create'} template`
                );
            }

            setSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/templates');
        } catch (err) {
            setError(err.message);
        }
    };

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <div className="bg-dark text-light min-vh-100 py-4">
            <Container style={{ maxWidth: '800px' }}>
                <Card className="bg-secondary text-light mb-4">
                    <Card.Body>
                        <h1 className="mb-4">
                            {isEditMode ? 'Edit Template' : 'Create Template'}
                        </h1>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            {/* Title */}
                            <Form.Group className="mb-3" controlId="formTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter a title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            {/* Description */}
                            <Form.Group className="mb-3" controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter a description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>

                            {/* Access & Topic */}
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formAccessType">
                                    <Form.Label>Access Type</Form.Label>
                                    <Form.Select
                                        value={accessType}
                                        onChange={(e) => setAccessType(e.target.value)}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formTopic">
                                    <Form.Label>Topic</Form.Label>
                                    <Form.Select
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    >
                                        <option value="Other">Other</option>
                                        <option value="Quiz">Quiz</option>
                                        <option value="Feedback">Feedback</option>
                                        <option value="Education">Education</option>
                                        <option value="Survey">Survey</option>
                                        <option value="Job">Job Application</option>
                                        <option value="Health">Health</option>
                                        <option value="Research">Research</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Entertainment">Entertainment</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                            {/* Image Upload */}
                            <Form.Group className="mb-3" controlId="formImageUpload">
                                <Form.Label>Image (Upload to Firebase)</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <Form.Text className="text-light">Uploading...</Form.Text>
                                )}
                                {imageUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={imageUrl}
                                            alt="Uploaded"
                                            style={{ width: '150px', border: '1px solid #999' }}
                                        />
                                    </div>
                                )}
                            </Form.Group>

                            {/* Tags */}
                            <Form.Group className="mb-3" controlId="formTags">
                                <Form.Label>Tags</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter a tag"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                    />
                                    <Button variant="info" onClick={handleAddTag}>
                                        Add Tag
                                    </Button>
                                </InputGroup>
                                <div className="mt-2">
                                    {tags.map((tag, index) => (
                                        <Badge
                                            bg="dark"
                                            className="me-2 mb-2"
                                            key={index}
                                            style={{ fontSize: '1rem' }}
                                        >
                                            {tag}{' '}
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={() => handleRemoveTag(tag)}
                                                style={{ border: 'none', marginLeft: '5px' }}
                                            >
                                                ×
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            </Form.Group>

                            <hr />

                            {/* Unlimited Questions */}
                            <h3>Questions (Unlimited)</h3>
                            <p className="text-muted">
                                Each question has a text prompt and a type.
                                (Old separate string/multiline/int/checkbox arrays are removed.)
                            </p>
                            {questions.map((q, i) => (
                                <div
                                    key={i}
                                    className="p-3 mb-2"
                                    style={{ backgroundColor: '#495057', borderRadius: '5px' }}
                                >
                                    <Form.Group className="mb-2">
                                        <Form.Label>Question Text</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={`Question ${i + 1} text`}
                                            value={q.question_text || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setQuestions((prev) =>
                                                    prev.map((item, idx) =>
                                                        idx === i ? { ...item, question_text: val } : item
                                                    )
                                                );
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-2">
                                        <Form.Label>Question Type</Form.Label>
                                        <Form.Select
                                            value={q.question_type || 'string'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setQuestions((prev) =>
                                                    prev.map((item, idx) =>
                                                        idx === i ? { ...item, question_type: val } : item
                                                    )
                                                );
                                            }}
                                        >
                                            <option value="string">String (single line)</option>
                                            <option value="multiline">Multiline</option>
                                            <option value="integer">Integer</option>
                                            <option value="checkbox">Checkbox</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() =>
                                            setQuestions((prev) => prev.filter((_, idx) => idx !== i))
                                        }
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}

                            <Button
                                variant="secondary"
                                className="mb-3"
                                onClick={() =>
                                    setQuestions((prev) => [
                                        ...prev,
                                        { question_text: '', question_type: 'string' },
                                    ])
                                }
                            >
                                + Add Question
                            </Button>

                            <hr />

                            <Button variant="success" type="submit">
                                {isEditMode ? 'Save Changes' : 'Create Template'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default TemplateForm;