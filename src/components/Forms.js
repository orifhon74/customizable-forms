import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Forms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');
                const response = await fetch(`${API_URL}/api/forms`, {
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
            <h1>Submitted Forms</h1>
            <table>
                <thead>
                <tr>
                    <th>Template</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {forms.map((form) => (
                    <tr key={form.id}>
                        <td>{form.Template?.title || 'N/A'}</td>
                        <td>{form.User?.username || 'N/A'}</td>
                        <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                        <td>
                            <Link to={`/forms/${form.id}`}>View Form</Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Forms;