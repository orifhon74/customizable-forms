// src/components/Forms.js
import React, { useEffect, useState } from 'react';
import { Table, Alert } from 'react-bootstrap';

function Forms() {
    const [forms, setForms] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const resp = await fetch('http://localhost:5001/api/forms', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) throw new Error('Failed to fetch forms');
                const data = await resp.json();
                setForms(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchForms();
    }, [token]);

    if (error) {
        return <Alert variant="danger">Error: {error}</Alert>;
    }

    return (
        <div className="mt-3">
            <h1>Your Forms</h1>
            <Table striped bordered hover responsive className="mt-3">
                <thead>
                <tr>
                    <th>Form ID</th>
                    <th>Template Title</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {forms.map((f) => (
                    <tr key={f.id}>
                        <td>{f.id}</td>
                        <td>{f.Template?.title || 'N/A'}</td>
                        <td>{f.User?.username || 'You'}</td>
                        <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}

export default Forms;