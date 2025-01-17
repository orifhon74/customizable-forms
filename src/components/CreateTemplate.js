// src/components/CreateTemplate.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateTemplate() {
    const navigate = useNavigate();

    // Basic template fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [topicId, setTopicId] = useState('Other'); // or 1/2/3, up to your new backend mapping
    const [accessType, setAccessType] = useState('public'); // or 'private'

    const [tags, setTags] = useState(''); // If you want to handle tags as comma-separated
    const [error, setError] = useState(null);

    /**
     * questions: An array of objects, each { question_text, question_type }
     * e.g. [{ question_text: 'What is your name?', question_type: 'string' }, ...]
     */
    const [questions, setQuestions] = useState([]);

    /**
     * Add a blank question to the array
     */
    const handleAddQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            { question_text: '', question_type: 'string' }, // default
        ]);
    };

    /**
     * Remove a question at a specific index
     */
    const handleRemoveQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    /**
     * Update a question's text or type
     */
    const handleQuestionChange = (index, field, value) => {
        setQuestions((prev) =>
            prev.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        );
    };

    /**
     * Submit form to create a new template
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must be logged in to create a template.');
            }

            // Convert tag string (like "hr, dev, sample") to an array
            let tagsArray = [];
            if (tags.trim()) {
                tagsArray = tags.split(',').map((t) => t.trim());
            }

            // Build request body for the new unlimited-questions backend
            const requestBody = {
                title,
                description,
                image_url: imageUrl,
                topic_id: topicId, // e.g. "Other" or "Quiz" if your backend mapping expects a string
                access_type: accessType,
                tags: tagsArray, // the new endpoint can handle tags as an array of strings
                questions, // the array of { question_text, question_type }
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Failed to create template');
            }

            const data = await response.json();
            console.log('Template created:', data);
            alert('Template created successfully!');
            navigate('/templates');
        } catch (err) {
            console.error('Error creating template:', err);
            setError(err.message);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '700px' }}>
            <h1 className="mb-4">Create Template (Unlimited Questions)</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Image URL */}
                <div className="mb-3">
                    <label className="form-label">Image URL (Optional)</label>
                    <input
                        type="url"
                        className="form-control"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>

                {/* Topic */}
                <div className="mb-3">
                    <label className="form-label">Topic</label>
                    <select
                        className="form-select"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                    >
                        <option value="Education">Education</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Access Type */}
                <div className="mb-3">
                    <label className="form-label">Access Type</label>
                    <select
                        className="form-select"
                        value={accessType}
                        onChange={(e) => setAccessType(e.target.value)}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                {/* Tags (comma-separated) */}
                <div className="mb-3">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. hr, dev, test"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                <hr />
                <h3>Questions</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Add as many questions as you want. Each question has a text and a type.
                </p>

                {questions.map((q, index) => (
                    <div
                        key={index}
                        className="card mb-3 p-3"
                        style={{ backgroundColor: '#f8f9fa' }}
                    >
                        <div className="mb-2">
                            <label className="form-label">Question Text</label>
                            <input
                                type="text"
                                className="form-control"
                                value={q.question_text}
                                onChange={(e) =>
                                    handleQuestionChange(index, 'question_text', e.target.value)
                                }
                                placeholder="Enter question prompt"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Question Type</label>
                            <select
                                className="form-select"
                                value={q.question_type}
                                onChange={(e) =>
                                    handleQuestionChange(index, 'question_type', e.target.value)
                                }
                            >
                                <option value="string">String (single line)</option>
                                <option value="multiline">Multiline</option>
                                <option value="integer">Integer</option>
                                <option value="checkbox">Checkbox</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveQuestion(index)}
                        >
                            Remove Question
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    className="btn btn-secondary mb-3"
                    onClick={handleAddQuestion}
                >
                    + Add Question
                </button>

                <hr />
                <button type="submit" className="btn btn-primary">
                    Create Template
                </button>
            </form>
        </div>
    );
}

export default CreateTemplate;