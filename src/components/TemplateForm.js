// src/components/TemplateForm.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const isEditMode = queryParams.get('edit') === 'true';
    const templateId = queryParams.get('templateId');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public');
    const [topicId, setTopicId] = useState(''); // must be an integer in your DB, but we'll store as string here

    // Arrays to store up to 4 question strings for each type
    const [stringQuestions, setStringQuestions] = useState(['', '', '', '']);
    const [multilineQuestions, setMultilineQuestions] = useState(['', '', '', '']);
    const [intQuestions, setIntQuestions] = useState(['', '', '', '']); // user enters question text as a string
    const [checkboxQuestions, setCheckboxQuestions] = useState(['', '', '', '']);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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

                    // Populate the form fields
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setAccessType(data.access_type || 'public');
                    setTopicId(String(data.topic_id) || '');

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

        // Decide POST or PUT based on edit mode
        const url = isEditMode
            ? `http://localhost:5001/api/templates/${templateId}`
            : 'http://localhost:5001/api/templates';
        const method = isEditMode ? 'PUT' : 'POST';

        // The back end expects arrays for questions
        const requestBody = {
            title,
            description,
            access_type: accessType,
            topic_id: parseInt(topicId, 10) || 0,
            stringQuestions,
            multilineQuestions,
            intQuestions,      // Our user enters the question text as a string
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
                throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} template`);
            }

            setSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/templates');
        } catch (err) {
            setError(err.message);
        }
    };

    // --------------------------------------------
    // Render
    // --------------------------------------------
    return (
        <div style={{ margin: '20px' }}>
            <h1>{isEditMode ? 'Edit Template' : 'Create Template'}</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSubmit}>
                {/* Basic Template Fields */}
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
                    <select value={accessType} onChange={(e) => setAccessType(e.target.value)}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <div>
                    <label>Topic ID:</label>
                    <input
                        type="number"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                    />
                </div>

                <hr />
                <h3>String Questions</h3>
                {stringQuestions.map((val, i) => (
                    <div key={i}>
                        <input
                            type="text"
                            placeholder={`String Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setStringQuestions((prev) =>
                                    prev.map((q, idx) => (idx === i ? e.target.value : q))
                                )
                            }
                        />
                    </div>
                ))}

                <hr />
                <h3>Multiline Questions</h3>
                {multilineQuestions.map((val, i) => (
                    <div key={i}>
            <textarea
                placeholder={`Multiline Question ${i + 1}`}
                value={val}
                onChange={(e) =>
                    setMultilineQuestions((prev) =>
                        prev.map((q, idx) => (idx === i ? e.target.value : q))
                    )
                }
            />
                    </div>
                ))}

                <hr />
                <h3>Integer Questions</h3>
                <p style={{ fontStyle: 'italic', color: '#555' }}>
                    (Enter the question text, e.g. "How many apples per day?" The user will provide an integer answer.)
                </p>
                {intQuestions.map((val, i) => (
                    <div key={i}>
                        <input
                            type="text"
                            placeholder={`Integer Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setIntQuestions((prev) =>
                                    prev.map((q, idx) => (idx === i ? e.target.value : q))
                                )
                            }
                        />
                    </div>
                ))}

                <hr />
                <h3>Checkbox Questions</h3>
                {checkboxQuestions.map((val, i) => (
                    <div key={i}>
                        <input
                            type="text"
                            placeholder={`Checkbox Question ${i + 1}`}
                            value={val}
                            onChange={(e) =>
                                setCheckboxQuestions((prev) =>
                                    prev.map((q, idx) => (idx === i ? e.target.value : q))
                                )
                            }
                        />
                    </div>
                ))}

                <hr />
                <button type="submit">{isEditMode ? 'Save Changes' : 'Create Template'}</button>
            </form>
        </div>
    );
}

export default TemplateForm;