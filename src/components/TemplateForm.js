import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const isEditMode = queryParams.get('edit') === 'true'; // Check if editing mode
    const templateId = queryParams.get('templateId'); // Get template ID if editing

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

    useEffect(() => {
        if (isEditMode && templateId) {
            // Fetch template details to pre-fill the form
            const fetchTemplate = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!response.ok) throw new Error('Failed to fetch template for editing');

                    const data = await response.json();

                    // Populate form fields
                    setTitle(data.title);
                    setDescription(data.description);
                    setAccessType(data.access_type || 'public');
                    setTopic(data.topic_id || '');
                    setQuestions({
                        stringQuestions: [
                            data.custom_string1_question || '',
                            data.custom_string2_question || '',
                            data.custom_string3_question || '',
                            data.custom_string4_question || '',
                        ],
                        multilineQuestions: [
                            data.custom_multiline1_question || '',
                            data.custom_multiline2_question || '',
                            data.custom_multiline3_question || '',
                            data.custom_multiline4_question || '',
                        ],
                        intQuestions: [
                            data.custom_int1_question || '',
                            data.custom_int2_question || '',
                            data.custom_int3_question || '',
                            data.custom_int4_question || '',
                        ],
                        checkboxQuestions: [
                            data.custom_checkbox1_question || '',
                            data.custom_checkbox2_question || '',
                            data.custom_checkbox3_question || '',
                            data.custom_checkbox4_question || '',
                        ],
                    });
                } catch (err) {
                    console.error(err.message);
                    setError('Failed to load template for editing.');
                }
            };

            fetchTemplate();
        }
    }, [isEditMode, templateId]);

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
            setError('You must be logged in to create or edit a template');
            return;
        }

        try {
            const url = isEditMode
                ? `http://localhost:5001/api/templates/${templateId}`
                : 'http://localhost:5001/api/templates';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
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

            if (!response.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} template`);

            const data = await response.json();
            setSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);

            console.log(`Template ${isEditMode ? 'updated' : 'created'} successfully`);
            navigate('/templates'); // Redirect to templates page after success
        } catch (err) {
            console.error(err.message);
            setError(`Failed to ${isEditMode ? 'update' : 'create'} template`);
        }
    };

    return (
        <div>
            <h1>{isEditMode ? 'Edit Template' : 'Create Template'}</h1>
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
                <button type="submit">{isEditMode ? 'Save Changes' : 'Create Template'}</button>
            </form>
        </div>
    );
}

export default TemplateForm;