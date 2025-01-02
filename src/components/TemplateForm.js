// src/components/TemplateForm.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../firebase'; // Firebase storage instance
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

    const API_URL = process.env.REACT_APP_API_URL;

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
                    const resp = await fetch(`${API_URL}/api/templates/${templateId}`, {
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
            ? `${API_URL}/api/templates/${templateId}`
            : `${API_URL}/api/templates`;
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
        <div style={{ margin: '20px' }}>
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
                    <select value={accessType} onChange={(e) => setAccessType(e.target.value)}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <div>
                    <label>Topic:</label>
                    <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                        <option value="">Select a topic</option>
                        <option value="Education">Education</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/*<div>*/}
                {/*    <label>Image (Upload to Firebase):</label>*/}
                {/*    <input type="file" onChange={(e) => setImageFile(e.target.files[0])}/>*/}
                {/*    <button type="button" onClick={handleImageUpload} disabled={uploading}>*/}
                {/*        {uploading ? 'Uploading...' : 'Upload Image'}*/}
                {/*    </button>*/}
                {/*</div>*/}

                <div>
                    <label>Image (Upload to Firebase):</label>
                    <input type="file" onChange={handleImageUpload}/>
                </div>

                <div>
                    <label>Tags:</label>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Enter a tag"
                    />
                    <button type="button" onClick={handleAddTag}>
                        Add Tag
                    </button>
                </div>
                <div>
                    {tags.map((tag, index) => (
                        <span key={index} style={{marginRight: '10px'}}>
                        {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)}>
                            ✕
                        </button>
                    </span>
                    ))}
                </div>

                <hr/>
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

                <hr/>
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

                <hr/>
                <h3>Integer Questions</h3>
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

                <hr/>
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

                <hr/>
                <button type="submit">{isEditMode ? 'Save Changes' : 'Create Template'}</button>
            </form>
        </div>
    );
}

export default TemplateForm;