// TemplateForm.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const isEditMode = queryParams.get('edit') === 'true';
    const templateId = queryParams.get('templateId');

    const token = localStorage.getItem('token');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const topics = ["Education", "Quiz", "Other"];
    const [topic, setTopic] = useState("Education");

    const [accessType, setAccessType] = useState('public');

    // question arrays
    const [stringQuestions, setStringQuestions] = useState(['', '', '', '']);
    const [multilineQuestions, setMultilineQuestions] = useState(['', '', '', '']);
    const [intQuestions, setIntQuestions] = useState(['', '', '', '']);
    const [checkboxQuestions, setCheckboxQuestions] = useState(['', '', '', '']);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/sign-in');
            return;
        }
        if (isEditMode && templateId) {
            const fetchTemplate = async () => {
                try {
                    const resp = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!resp.ok) throw new Error('Failed to fetch template for editing');
                    const data = await resp.json();

                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setImageUrl(data.image_url || '');
                    setTopic(data.topic || 'Education');
                    setAccessType(data.access_type || 'public');

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
    }, [isEditMode, templateId, token, navigate]);

    const handleImageUpload = (file) => {
        if (!file) return;
        const storageRef = ref(storage, `template-images/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (err) => {
                setError(`Firebase upload error: ${err.message}`);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setImageUrl(downloadURL);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const url = isEditMode
            ? `http://localhost:5001/api/templates/${templateId}`
            : 'http://localhost:5001/api/templates';
        const method = isEditMode ? 'PUT' : 'POST';

        const bodyData = {
            title,
            description,
            image_url: imageUrl,
            topic,
            access_type: accessType,
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
                body: JSON.stringify(bodyData),
            });
            if (!resp.ok) {
                const data = await resp.json().catch(() => null);
                throw new Error(data?.error || 'Failed to save template');
            }
            setSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/templates');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto' }}>
            <h1>{isEditMode ? 'Edit Template' : 'Create Template'}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Topic</Form.Label>
                            <Form.Select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            >
                                {topics.map((tp) => (
                                    <option key={tp} value={tp}>{tp}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Access Type</Form.Label>
                            <Form.Select
                                value={accessType}
                                onChange={(e) => setAccessType(e.target.value)}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => handleImageUpload(e.target.files[0])}
                            />
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div>Uploading: {Math.round(uploadProgress)}%</div>
                            )}
                            {imageUrl && (
                                <div className="mt-2">
                                    <img src={imageUrl} alt="Preview" style={{ maxHeight: '150px' }} />
                                </div>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <hr />
                <h4>String Questions (up to 4)</h4>
                {stringQuestions.map((val, i) => (
                    <Form.Group className="mb-2" key={`string-${i}`}>
                        <Form.Control
                            placeholder={`String Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setStringQuestions((prev) =>
                                    prev.map((v, idx) => (idx === i ? e.target.value : v))
                                )
                            }
                        />
                    </Form.Group>
                ))}

                <h4>Multiline Questions (up to 4)</h4>
                {multilineQuestions.map((val, i) => (
                    <Form.Group className="mb-2" key={`multi-${i}`}>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder={`Multiline Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setMultilineQuestions((prev) =>
                                    prev.map((v, idx) => (idx === i ? e.target.value : v))
                                )
                            }
                        />
                    </Form.Group>
                ))}

                <h4>Integer Questions (up to 4)</h4>
                {intQuestions.map((val, i) => (
                    <Form.Group className="mb-2" key={`int-${i}`}>
                        <Form.Control
                            placeholder={`Integer Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setIntQuestions((prev) =>
                                    prev.map((v, idx) => (idx === i ? e.target.value : v))
                                )
                            }
                        />
                    </Form.Group>
                ))}

                <h4>Checkbox Questions (up to 4)</h4>
                {checkboxQuestions.map((val, i) => (
                    <Form.Group className="mb-2" key={`checkbox-${i}`}>
                        <Form.Control
                            placeholder={`Checkbox Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setCheckboxQuestions((prev) =>
                                    prev.map((v, idx) => (idx === i ? e.target.value : v))
                                )
                            }
                        />
                    </Form.Group>
                ))}

                <Button variant="primary" type="submit" className="mt-3">
                    {isEditMode ? 'Save Template' : 'Create Template'}
                </Button>
            </Form>
        </div>
    );
}

export default TemplateForm;