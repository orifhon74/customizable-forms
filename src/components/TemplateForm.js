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
    const [topic, setTopic] = useState('Other'); // Default to "Other"
    const [imageUrl, setImageUrl] = useState(''); // Firebase URL for uploaded image
    const [uploading, setUploading] = useState(false);

    const [stringQuestions, setStringQuestions] = useState(['', '', '', '']);
    const [multilineQuestions, setMultilineQuestions] = useState(['', '', '', '']);
    const [intQuestions, setIntQuestions] = useState(['', '', '', '']);
    const [checkboxQuestions, setCheckboxQuestions] = useState(['', '', '', '']);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [tags, setTags] = useState([]); // Store tags as an array of strings
    const [tagInput, setTagInput] = useState(''); // Temporary input for the tag field

    // Handle adding a new tag
    const handleAddTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags((prev) => [...prev, trimmedTag]);
            setTagInput('');
        }
    };

    // Handle removing an existing tag
    const handleRemoveTag = (tagToRemove) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    };

    // Fetch existing template data if in edit mode
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
                    setTopic(data.topic_id ? mapTopicIdToName(data.topic_id) : 'Other');
                    setImageUrl(data.image_url || '');
                    setTags(data.tags ? data.tags.map(tag => tag.name) : []);

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

    // Function to map topic_id to topic name
    const mapTopicIdToName = (topicId) => {
        const mapping = {
            1: 'Education',
            2: 'Quiz',
            3: 'Other',
        };
        return mapping[topicId] || 'Other';
    };

    // Handle form submission for create/update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to create or edit a template');
            return;
        }

        // Ensure that topic is set to "Other" if not selected
        const selectedTopic = topic || 'Other';

        const url = isEditMode
            ? `http://localhost:5001/api/templates/${templateId}`
            : 'http://localhost:5001/api/templates';
        const method = isEditMode ? 'PUT' : 'POST';

        const requestBody = {
            title,
            description,
            access_type: accessType,
            topic_id: selectedTopic, // Send topic name; backend will map to ID
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
                const respData = await resp.json();
                throw new Error(respData.error || `Failed to ${isEditMode ? 'update' : 'create'} template`);
            }

            const respData = await resp.json();
            setSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/templates');
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle image file selection and upload
    const handleImageUpload = async (e) => {
        const file = e.target?.files?.[0];
        if (!file) {
            setError('No file selected');
            return;
        }

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

    // Handle "Enter" key press for adding tags
    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    // Render the form
    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col xs={12} md={8}>
                    <h1 className="mb-4 text-center">
                        {isEditMode ? 'Edit Template' : 'Create Template'}
                    </h1>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* Title */}
                        <Form.Group controlId="formTitle" className="mb-3">
                            <Form.Label>
                                Title <span className="text-danger">*</span>
                            </Form.Label>
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
                                <option value="Other">Other</option>
                                <option value="Education">Education</option>
                                <option value="Quiz">Quiz</option>
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
                                <div className="mt-2 d-flex align-items-center">
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    <span>Uploading...</span>
                                </div>
                            )}
                            {imageUrl && (
                                <div className="mt-2">
                                    <img
                                        src={imageUrl}
                                        alt="Uploaded"
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px' }}
                                    />
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
                                    onKeyPress={handleTagKeyPress}
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
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRemoveTag(tag)}
                                    >
                                        {tag} &times;
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        <hr />

                        {/* String Questions */}
                        <Form.Group className="mb-4">
                            <Form.Label>
                                <strong>String Questions</strong>
                            </Form.Label>
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
                            <Form.Label>
                                <strong>Multiline Questions</strong>
                            </Form.Label>
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
                            <Form.Label>
                                <strong>Integer Questions</strong>
                            </Form.Label>
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
                            <Form.Label>
                                <strong>Checkbox Questions</strong>
                            </Form.Label>
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

                        <hr />

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