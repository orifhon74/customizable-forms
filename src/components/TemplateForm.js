import React, { useState } from 'react';

function TemplateForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public');
    const [topicId, setTopicId] = useState(1); // Default topic ID
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to create a template');
            return;
        }

        const payload = {
            title,
            description,
            access_type: accessType,
            topic_id: topicId,
            custom_string1_state: true,
            custom_string1_question: 'What is your name?', // Hardcoded for testing
        };

        console.log('Submitting Template Payload:', payload); // Debug payload

        try {
            const response = await fetch('http://localhost:5001/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to create template');
            }

            const data = await response.json();
            setSuccess('Template created successfully!');
            setTitle('');
            setDescription('');
            setAccessType('public');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Create a Template</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Access Type:</label>
                    <select
                        value={accessType}
                        onChange={(e) => setAccessType(e.target.value)}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <div>
                    <label>Topic ID:</label>
                    <input
                        type="number"
                        value={topicId}
                        onChange={(e) => setTopicId(Number(e.target.value))}
                        required
                    />
                </div>
                <button type="submit">Create Template</button>
            </form>
        </div>
    );
}

export default TemplateForm;