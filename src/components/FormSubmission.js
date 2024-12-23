import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function FormSubmission() {
    const { templateId } = useParams(); // Retrieve the templateId from the route
    const [template, setTemplate] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/templates/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setTemplate(data);
            } catch (err) {
                console.error('Error fetching template:', err);
                setError(err.message);
            }
        };

        fetchTemplate();
    }, [templateId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAnswers({
            ...answers,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/forms/${templateId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(answers),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            const data = await response.json();
            setSuccess('Form submitted successfully!');
            setTimeout(() => navigate('/forms'), 2000); // Redirect to Forms page
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!template) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Submit Form for Template: {template.title}</h1>
            <form onSubmit={handleSubmit}>
                {template.custom_string1_state && (
                    <div>
                        <label>{template.custom_string1_question}</label>
                        <input
                            type="text"
                            name="string1_answer"
                            value={answers.string1_answer || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_int1_state && (
                    <div>
                        <label>{template.custom_int1_question}</label>
                        <input
                            type="number"
                            name="int1_answer"
                            value={answers.int1_answer || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}
                {template.custom_checkbox1_state && (
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="checkbox1_answer"
                                checked={answers.checkbox1_answer || false}
                                onChange={handleChange}
                            />
                            {template.custom_checkbox1_question}
                        </label>
                    </div>
                )}
                <button type="submit">Submit Form</button>
            </form>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default FormSubmission;