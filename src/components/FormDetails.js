import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function FormDetails() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');
                const response = await fetch(`http://localhost:5001/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setForm(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFormDetails();
    }, [formId]);

    if (error) return <h2 style={{ color: 'red' }}>Error: {error}</h2>;
    if (!form) return <h2>Loading...</h2>;

    return (
        <div style={{ margin: '20px' }}>
            <h1>Form Details</h1>
            <p>
                <strong>Template:</strong> {form.Template?.title || 'N/A'}
            </p>
            <p>
                <strong>Submitted By:</strong> {form.User?.username || 'N/A'}
            </p>
            <p>
                <strong>Date Submitted:</strong> {new Date(form.createdAt).toLocaleDateString()}
            </p>
            <h2>Answers</h2>
            <ul>
                {Object.keys(form)
                    .filter((key) => key.includes('_answer') && form[key])
                    .map((key) => {
                        const questionKey = key.replace('_answer', '_question');
                        const question = form.Template[questionKey];
                        return (
                            <li key={key}>
                                <strong>{question || key.replace('_answer', '')}:</strong>{' '}
                                {typeof form[key] === 'boolean'
                                    ? form[key]
                                        ? 'Yes'
                                        : 'No'
                                    : form[key]}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}

export default FormDetails;