// src/components/TemplateForm.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../firebase'; // Firebase storage instance
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// React Bootstrap imports
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

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const isEditMode = queryParams.get('edit') === 'true';
    const templateId = queryParams.get('templateId');

    // -----------------------------
    // State for form fields
    // -----------------------------
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public');
    // Default topic set to "Other"
    const [topic, setTopic] = useState('Other');
    const [imageUrl, setImageUrl] = useState('');

    // We store questions in arrays, which we'll send as arrays to the backend:
    const [stringQuestions, setStringQuestions] = useState(['', '', '', '']);
    const [multilineQuestions, setMultilineQuestions] = useState(['', '', '', '']);
    const [intQuestions, setIntQuestions] = useState(['', '', '', '']);
    const [checkboxQuestions, setCheckboxQuestions] = useState(['', '', '', '']);

    // Tags
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // UI states
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploading, setUploading] = useState(false);

    // -----------------------------
    // Add/remove tag handlers
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
    // Fetch existing template if editing
    // -----------------------------
    useEffect(() => {
        if (isEditMode && templateId) {
            const fetchTemplate = async () => {
                const token = localStorage.getItem('token');
                if (!token) return;

                try {
                    const resp = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!resp.ok) {
                        throw new Error('Failed to fetch template for editing');
                    }
                    const data = await resp.json();

                    // Populate state with existing template data
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setAccessType(data.access_type || 'public');
                    setTopic(data.topic_id || 'Other');
                    setImageUrl(data.image_url || '');
                    setTags(data.tags || []);

                    // Map existing questions from the template into arrays
                    setStringQuestions([
                        data.custom_string1_question || '',
                        data.custom_string2_question || '',
                        data.custom_string3_question || '',
                        data.custom_string4_question || '',
                    ]);
                    setMultilineQuestions([
                        data.custom_multiline1_question || '',
                        data.custom_multiline2_question || '',
                        data.custom_multiline3_question || '',
                        data.custom_multiline4_question || '',
                    ]);
                    setIntQuestions([
                        data.custom_int1_question || '',
                        data.custom_int2_question || '',
                        data.custom_int3_question || '',
                        data.custom_int4_question || '',
                    ]);
                    setCheckboxQuestions([
                        data.custom_checkbox1_question || '',
                        data.custom_checkbox2_question || '',
                        data.custom_checkbox3_question || '',
                        data.custom_checkbox4_question || '',
                    ]);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchTemplate();
        }
    }, [isEditMode, templateId]);

    // -----------------------------
    // Handle image file selection/upload
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
    // Handle form submission
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

        // Decide if we are creating or updating
        const url = isEditMode
            ? `http://localhost:5001/api/templates/${templateId}`
            : 'http://localhost:5001/api/templates';
        const method = isEditMode ? 'PUT' : 'POST';

        // Prepare the request body, passing arrays for the questions
        const requestBody = {
            title,
            description,
            access_type: accessType,
            topic_id: topic,
            image_url: imageUrl,
            tags,
            stringQuestions,
            multilineQuestions,
            intQuestions,
            checkboxQuestions,
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
                    msg.error ||
                    `Failed to ${isEditMode ? 'update' : 'create'} template`
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

                        {/* Error/Success Messages */}
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

                            {/* Access Type & Topic */}
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
                                        <option value="Education">Education</option>
                                        <option value="Quiz">Quiz</option>
                                        <option value="Other">Other</option>
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
                                <InputGroup className="mb-2">
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
                                <div>
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

                            {/* String Questions */}
                            <h3>String Questions</h3>
                            {stringQuestions.map((val, i) => (
                                <Form.Group className="mb-3" key={`string-${i}`}>
                                    <Form.Label>String Question {i + 1}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={`String Question ${i + 1}`}
                                        value={val}
                                        onChange={(e) =>
                                            setStringQuestions((prev) =>
                                                prev.map((q, idx) => (idx === i ? e.target.value : q))
                                            )
                                        }
                                    />
                                </Form.Group>
                            ))}

                            <hr />

                            {/* Multiline Questions */}
                            <h3>Multiline Questions</h3>
                            {multilineQuestions.map((val, i) => (
                                <Form.Group className="mb-3" key={`multi-${i}`}>
                                    <Form.Label>Multiline Question {i + 1}</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder={`Multiline Question ${i + 1}`}
                                        value={val}
                                        onChange={(e) =>
                                            setMultilineQuestions((prev) =>
                                                prev.map((q, idx) => (idx === i ? e.target.value : q))
                                            )
                                        }
                                    />
                                </Form.Group>
                            ))}

                            <hr />

                            {/* Integer Questions */}
                            <h3>Integer Questions</h3>
                            {intQuestions.map((val, i) => (
                                <Form.Group className="mb-3" key={`int-${i}`}>
                                    <Form.Label>Integer Question {i + 1}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder={`Integer Question ${i + 1}`}
                                        value={val}
                                        onChange={(e) =>
                                            setIntQuestions((prev) =>
                                                prev.map((q, idx) => (idx === i ? e.target.value : q))
                                            )
                                        }
                                    />
                                </Form.Group>
                            ))}

                            <hr />

                            {/* Checkbox Questions */}
                            <h3>Checkbox Questions</h3>
                            {checkboxQuestions.map((val, i) => (
                                <Form.Group className="mb-3" key={`checkbox-${i}`}>
                                    <Form.Label>Checkbox Question {i + 1}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={`Checkbox Question ${i + 1}`}
                                        value={val}
                                        onChange={(e) =>
                                            setCheckboxQuestions((prev) =>
                                                prev.map((q, idx) => (idx === i ? e.target.value : q))
                                            )
                                        }
                                    />
                                </Form.Group>
                            ))}

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