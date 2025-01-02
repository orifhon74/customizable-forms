import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function FormDetails() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // User details
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');
                const response = await fetch(`${API_URL}/api/forms/${formId}`, {
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

    const handleEditForm = () => {
        navigate(`/edit-form/${formId}`);
    };

    const handleDeleteForm = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete form');
            navigate('/forms'); // Redirect back to forms page
        } catch (err) {
            console.error(err.message);
            setError('Failed to delete the form.');
        }
    };

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

            {/* Edit and Delete buttons for admins or the template owner */}
            {(isAdmin || user?.id === form.Template?.user_id) && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleEditForm} style={{ marginRight: '10px' }}>
                        Edit Form
                    </button>
                    <button onClick={handleDeleteForm} style={{ backgroundColor: 'red', color: 'white' }}>
                        Delete Form
                    </button>
                </div>
            )}
        </div>
    );
}

export default FormDetails;