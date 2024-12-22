import React, { useEffect, useState } from 'react';

function Forms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');

                const response = await fetch('http://localhost:5001/api/forms', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    if (loading) return <h2>Loading...</h2>;
    if (error) return <h2>Error: {error}</h2>;

    return (
        <div>
            <h1>Forms</h1>
            {forms.length === 0 ? (
                <p>No forms available.</p>
            ) : (
                <ul>
                    {forms.map((form) => (
                        <li key={form.id}>
                            <p>
                                <strong>Template:</strong> {form.Template?.title || 'N/A'}
                            </p>
                            <p>
                                <strong>Submitted By:</strong> {form.User?.username || 'N/A'}
                            </p>
                            <p>
                                <strong>Answer:</strong> {form.string1_answer || 'N/A'}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Forms;