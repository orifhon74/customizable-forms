// src/components/Forms.js
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
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
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
    if (error) return <h2 style={{ color: 'red' }}>Error: {error}</h2>;

    return (
        <div style={{ margin: '20px' }}>
            <h1>Forms</h1>
            <table>
                <thead>
                <tr>
                    <th>Template</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {forms.map((form) => (
                    <tr key={form.id}>
                        <td>{form.Template?.title || 'N/A'}</td>
                        <td>{form.User?.username || 'N/A'}</td>
                        <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Forms;