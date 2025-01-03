// src/components/TemplateForm.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../firebase'; // Firebase storage instance
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Alert,
    Badge,
    Spinner,
    InputGroup,
} from 'react-bootstrap';

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const isEditMode = queryParams.get('edit') === 'true';
    const templateId = queryParams.get('templateId');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public');
    const [topic, setTopic] = useState(''); // "Education", "Quiz", "Other"
    const [imageFile, setImageFile] = useState(null); // Image upload state
    const [imageUrl, setImageUrl] = useState(''); // Firebase URL for uploaded image

    const [stringQuestions, setStringQuestions] = useState(['', '', '', '']);
    const [multilineQuestions, setMultilineQuestions] = useState(['', '', '', '']);
    const [intQuestions, setIntQuestions] = useState(['', '', '', '']);
    const [checkboxQuestions, setCheckboxQuestions] = useState(['', '', '', '']);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [tags, setTags] = useState([]); // Store tags as an array of strings
    const [tagInput, setTagInput] = useState(''); // Temporary input for the tag field

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput)) {
            setTags((prev) => [...prev, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    };

    // --------------------------------------------
    // Fetch existing template if editing
    // --------------------------------------------
    useEffect(() => {
        if (isEditMode && templateId) {
            const fetchTemplate = async () => {
                const token = localStorage.getItem('token');
                try {
                    const resp = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!resp.ok) throw new Error('Failed to fetch template for editing');
                    const data = await resp.json();

                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setAccessType(data.access_type || 'public');
                    setTopic(data.topic_id || ''); // Assuming topic_id maps to "Education", etc.
                    setImageUrl(data.image_url || '');
                    setTags(data.tags || []);

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

    // --------------------------------------------
    // Handle form submission for create/update
    // --------------------------------------------
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
            ? `http://localhost:5001/api/templates/${templateId}`
            : 'http://localhost:5001/api/templates';
        const method = isEditMode ? 'PUT' : 'POST';

        const requestBody = {
            title,
            description,
            access_type: accessType,
            topic_id: topic, // Directly use topic name, assuming backend supports it
            image_url: imageUrl, // Firebase URL
            stringQuestions,
            multilineQuestions,
            intQuestions,
            checkboxQuestions,
            tags,
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
                throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} template`);
            }

            setSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/templates');
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle image file selection
    const handleImageUpload = async (e) => {
        const file = e.target?.files?.[0]; // Safely access the file
        if (!file) {
            setError('No file selected');
            return;
        }

        setImageFile(file);

        const storageRef = ref(storage, `template-images/${Date.now()}-${file.name}`);
        try {
            setUploading(true);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setImageUrl(url); // Set the Firebase URL
            setUploading(false);
        } catch (err) {
            setError('Failed to upload image');
            setUploading(false);
        }
    };

    // --------------------------------------------
    // Render
    // --------------------------------------------
    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col xs={12} md={8}>
                    <h1 className="mb-4 text-center">{isEditMode ? 'Edit Template' : 'Create Template'}</h1>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* Title */}
                        <Form.Group controlId="formTitle" className="mb-3">
                            <Form.Label>Title<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Description */}
                        <Form.Group controlId="formDescription" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>

                        {/* Access Type */}
                        <Form.Group controlId="formAccessType" className="mb-3">
                            <Form.Label>Access Type</Form.Label>
                            <Form.Select
                                value={accessType}
                                onChange={(e) => setAccessType(e.target.value)}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Topic */}
                        <Form.Group controlId="formTopic" className="mb-3">
                            <Form.Label>Topic</Form.Label>
                            <Form.Select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            >
                                <option value="">Select a topic</option>
                                <option value="Education">Education</option>
                                <option value="Quiz">Quiz</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Image Upload */}
                        <Form.Group controlId="formImage" className="mb-3">
                            <Form.Label>Image (Upload to Firebase)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            {uploading && (
                                <div className="mt-2">
                                    <Spinner animation="border" size="sm" /> Uploading...
                                </div>
                            )}
                            {imageUrl && (
                                <div className="mt-2">
                                    <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
                                </div>
                            )}
                        </Form.Group>

                        {/* Tags */}
                        <Form.Group controlId="formTags" className="mb-3">
                            <Form.Label>Tags</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter a tag"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <Button variant="secondary" onClick={handleAddTag}>
                                    Add Tag
                                </Button>
                            </InputGroup>
                            <div className="mt-2">
                                {tags.map((tag, index) => (
                                    <Badge
                                        bg="primary"
                                        pill
                                        className="me-2 mb-2"
                                        key={index}
                                    >
                                        {tag}{' '}
                                        <span
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            &times;
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        <hr />

                        {/* String Questions */}
                        <Form.Group className="mb-4">
                            <Form.Label><strong>String Questions</strong></Form.Label>
                            {stringQuestions.map((val, i) => (
                                <Form.Group controlId={`stringQuestion${i}`} className="mb-2" key={i}>
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
                        </Form.Group>

                        <hr />

                        {/* Multiline Questions */}
                        <Form.Group className="mb-4">
                            <Form.Label><strong>Multiline Questions</strong></Form.Label>
                            {multilineQuestions.map((val, i) => (
                                <Form.Group controlId={`multilineQuestion${i}`} className="mb-2" key={i}>
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
                        </Form.Group>

                        <hr />

                        {/* Integer Questions */}
                        <Form.Group className="mb-4">
                            <Form.Label><strong>Integer Questions</strong></Form.Label>
                            {intQuestions.map((val, i) => (
                                <Form.Group controlId={`intQuestion${i}`} className="mb-2" key={i}>
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
                        </Form.Group>

                        <hr />

                        {/* Checkbox Questions */}
                        <Form.Group className="mb-4">
                            <Form.Label><strong>Checkbox Questions</strong></Form.Label>
                            {checkboxQuestions.map((val, i) => (
                                <Form.Group controlId={`checkboxQuestion${i}`} className="mb-2" key={i}>
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
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            {isEditMode ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default TemplateForm;