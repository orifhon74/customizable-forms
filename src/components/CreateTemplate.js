// src/components/CreateTemplate.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateTemplate() {
    const navigate = useNavigate();

    // Basic template fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [topicId, setTopicId] = useState('1'); // default topic ID
    const [accessType, setAccessType] = useState('public'); // or 'private'

    // Single-line string questions (up to 4)
    const [stringQ1, setStringQ1] = useState('');
    const [stringQ2, setStringQ2] = useState('');
    const [stringQ3, setStringQ3] = useState('');
    const [stringQ4, setStringQ4] = useState('');

    // Multi-line text questions (up to 4)
    const [multilineQ1, setMultilineQ1] = useState('');
    const [multilineQ2, setMultilineQ2] = useState('');
    const [multilineQ3, setMultilineQ3] = useState('');
    const [multilineQ4, setMultilineQ4] = useState('');

    // Integer questions (up to 4)
    const [intQ1, setIntQ1] = useState('');
    const [intQ2, setIntQ2] = useState('');
    const [intQ3, setIntQ3] = useState('');
    const [intQ4, setIntQ4] = useState('');

    // Checkbox questions (up to 4)
    const [checkboxQ1, setCheckboxQ1] = useState('');
    const [checkboxQ2, setCheckboxQ2] = useState('');
    const [checkboxQ3, setCheckboxQ3] = useState('');
    const [checkboxQ4, setCheckboxQ4] = useState('');

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Prepare arrays for each question type
        const stringQuestions = [stringQ1, stringQ2, stringQ3, stringQ4];
        const multilineQuestions = [multilineQ1, multilineQ2, multilineQ3, multilineQ4];
        const intQuestions = [intQ1, intQ2, intQ3, intQ4];
        const checkboxQuestions = [checkboxQ1, checkboxQ2, checkboxQ3, checkboxQ4];

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    image_url: imageUrl,
                    topic_id: parseInt(topicId, 10) || 1,
                    access_type: accessType,
                    stringQuestions,
                    multilineQuestions,
                    intQuestions,
                    checkboxQuestions,
                }),
            });

            if (!response.ok) {
                // Attempt to parse the JSON error message
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Failed to create template');
            }

            // If successful
            const data = await response.json();
            console.log('Template created:', data);
            alert('Template created successfully!');
            navigate('/templates'); // or wherever you want to go next
        } catch (err) {
            console.error('Error creating template:', err);
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Create Template</h1>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                {/* Image URL */}
                <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                        type="url"
                        className="form-control"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>

                {/* Topic ID */}
                <div className="form-group">
                    <label>Topic ID (for your DB - required in your backend)</label>
                    <input
                        type="number"
                        className="form-control"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                    />
                </div>

                {/* Access Type */}
                <div className="form-group">
                    <label>Access Type</label>
                    <select
                        className="form-control"
                        value={accessType}
                        onChange={(e) => setAccessType(e.target.value)}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <hr />
                <h2>String Questions (up to 4)</h2>
                <div className="form-group">
                    <label>String Q1</label>
                    <input
                        type="text"
                        className="form-control"
                        value={stringQ1}
                        onChange={(e) => setStringQ1(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>String Q2</label>
                    <input
                        type="text"
                        className="form-control"
                        value={stringQ2}
                        onChange={(e) => setStringQ2(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>String Q3</label>
                    <input
                        type="text"
                        className="form-control"
                        value={stringQ3}
                        onChange={(e) => setStringQ3(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>String Q4</label>
                    <input
                        type="text"
                        className="form-control"
                        value={stringQ4}
                        onChange={(e) => setStringQ4(e.target.value)}
                    />
                </div>

                <hr />
                <h2>Multiline Questions (up to 4)</h2>
                <div className="form-group">
                    <label>Multiline Q1</label>
                    <input
                        type="text"
                        className="form-control"
                        value={multilineQ1}
                        onChange={(e) => setMultilineQ1(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Multiline Q2</label>
                    <input
                        type="text"
                        className="form-control"
                        value={multilineQ2}
                        onChange={(e) => setMultilineQ2(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Multiline Q3</label>
                    <input
                        type="text"
                        className="form-control"
                        value={multilineQ3}
                        onChange={(e) => setMultilineQ3(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Multiline Q4</label>
                    <input
                        type="text"
                        className="form-control"
                        value={multilineQ4}
                        onChange={(e) => setMultilineQ4(e.target.value)}
                    />
                </div>

                <hr />
                <h2>Integer Questions (up to 4)</h2>
                <div className="form-group">
                    <label>Int Q1</label>
                    <input
                        type="text"
                        className="form-control"
                        value={intQ1}
                        onChange={(e) => setIntQ1(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Int Q2</label>
                    <input
                        type="text"
                        className="form-control"
                        value={intQ2}
                        onChange={(e) => setIntQ2(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Int Q3</label>
                    <input
                        type="text"
                        className="form-control"
                        value={intQ3}
                        onChange={(e) => setIntQ3(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Int Q4</label>
                    <input
                        type="text"
                        className="form-control"
                        value={intQ4}
                        onChange={(e) => setIntQ4(e.target.value)}
                    />
                </div>

                <hr />
                <h2>Checkbox Questions (up to 4)</h2>
                <p style={{ fontSize: '0.9rem' }}>
                    (Enter the question text. The state to display in forms
                    will be determined by your <code>custom_checkboxX_state</code>
                    field. Just leaving it as normal text fields for the question.)
                </p>
                <div className="form-group">
                    <label>Checkbox Q1</label>
                    <input
                        type="text"
                        className="form-control"
                        value={checkboxQ1}
                        onChange={(e) => setCheckboxQ1(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Checkbox Q2</label>
                    <input
                        type="text"
                        className="form-control"
                        value={checkboxQ2}
                        onChange={(e) => setCheckboxQ2(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Checkbox Q3</label>
                    <input
                        type="text"
                        className="form-control"
                        value={checkboxQ3}
                        onChange={(e) => setCheckboxQ3(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Checkbox Q4</label>
                    <input
                        type="text"
                        className="form-control"
                        value={checkboxQ4}
                        onChange={(e) => setCheckboxQ4(e.target.value)}
                    />
                </div>

                <hr />
                <button type="submit" className="btn btn-primary">
                    Create Template
                </button>
            </form>
        </div>
    );
}

export default CreateTemplate;