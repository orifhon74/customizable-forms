import React, { useState } from 'react';

function FormSubmission({ templateId }) {
    const [stringAnswer, setStringAnswer] = useState('');
    const [intAnswer, setIntAnswer] = useState('');
    const [checkboxAnswer, setCheckboxAnswer] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to submit a form');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    template_id: templateId,
                    string1_answer: stringAnswer,
                    int1_answer: parseInt(intAnswer, 10),
                    checkbox1_answer: checkboxAnswer,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            const data = await response.json();
            setSuccess('Form submitted successfully!');
            setStringAnswer('');
            setIntAnswer('');
            setCheckboxAnswer(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Submit a Form</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>String Answer:</label>
                    <input type="text" value={stringAnswer} onChange={(e) => setStringAnswer(e.target.value)} required />
                </div>
                <div>
                    <label>Integer Answer:</label>
                    <input type="number" value={intAnswer} onChange={(e) => setIntAnswer(e.target.value)} required />
                </div>
                <div>
                    <label>Checkbox Answer:</label>
                    <input type="checkbox" checked={checkboxAnswer} onChange={(e) => setCheckboxAnswer(e.target.checked)} />
                </div>
                <button type="submit">Submit Form</button>
            </form>
        </div>
    );
}

export default FormSubmission;