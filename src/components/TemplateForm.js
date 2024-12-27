import React, { useState } from 'react';

function TemplateForm() {
    const [questions, setQuestions] = useState({
        stringQuestions: ['', '', '', ''],
        multilineQuestions: ['', '', '', ''],
        intQuestions: ['', '', '', ''],
        checkboxQuestions: ['', '', '', ''],
    });
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public'); // Default to public
    const [topic, setTopic] = useState(''); // Add topic state
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleQuestionChange = (type, index, value) => {
        setQuestions((prev) => ({
            ...prev,
            [type]: prev[type].map((q, i) => (i === index ? value : q)),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            setError('You must be logged in to create a template');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    access_type: accessType,
                    topic_id: topic, // Pass topic_id to backend
                    ...questions,
                }),
            });

            if (!response.ok) throw new Error('Failed to create template');

            const data = await response.json();
            setSuccess('Template created successfully!');

            console.log('Template created successfully');
        } catch (err) {
            console.error(err.message);
            setError('Failed to create template');
        }
    };

    return (
        <div>
            <h1>Create Template</h1>
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
                    <label>Topic:</label>
                    <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                    >
                        <option value="">Select a topic</option>
                        <option value="1">Education</option>
                        <option value="2">Quiz</option>
                        <option value="3">Other</option>
                        {/* Add more topics as needed */}
                    </select>
                </div>
                <h3>String Questions</h3>
                {questions.stringQuestions.map((q, i) => (
                    <input
                        key={i}
                        value={q}
                        onChange={(e) => handleQuestionChange('stringQuestions', i, e.target.value)}
                        placeholder={`Question ${i + 1}`}
                    />
                ))}
                <h3>Multi-line Text Questions</h3>
                {questions.multilineQuestions.map((q, i) => (
                    <textarea
                        key={i}
                        value={q}
                        onChange={(e) => handleQuestionChange('multilineQuestions', i, e.target.value)}
                        placeholder={`Multi-line Question ${i + 1}`}
                    />
                ))}
                <h3>Integer Questions</h3>
                {questions.intQuestions.map((q, i) => (
                    <input
                        key={i}
                        value={q}
                        onChange={(e) => handleQuestionChange('intQuestions', i, e.target.value)}
                        placeholder={`Question ${i + 1}`}
                    />
                ))}
                <h3>Checkbox Questions</h3>
                {questions.checkboxQuestions.map((q, i) => (
                    <input
                        key={i}
                        value={q}
                        onChange={(e) => handleQuestionChange('checkboxQuestions', i, e.target.value)}
                        placeholder={`Question ${i + 1}`}
                    />
                ))}
                <button type="submit">Create Template</button>
            </form>
        </div>
    );
}

export default TemplateForm;