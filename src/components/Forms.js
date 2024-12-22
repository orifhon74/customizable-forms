import React, { useState } from 'react';

function FillForm({ template }) {
    const [formData, setFormData] = useState({
        string1_answer: '',
        int1_answer: null,
        checkbox1_answer: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:5001/api/forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your token retrieval logic
            },
            body: JSON.stringify({ ...formData, template_id: template.id }),
        })
            .then((res) => res.json())
            .then((data) => console.log('Form submitted:', data))
            .catch((err) => console.error('Error submitting form:', err));
    };

    return (
        <form onSubmit={handleSubmit}>
            {template.custom_string1_state && (
                <div>
                    <label>{template.custom_string1_question}</label>
                    <input
                        type="text"
                        name="string1_answer"
                        value={formData.string1_answer}
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
                        value={formData.int1_answer || ''}
                        onChange={handleChange}
                    />
                </div>
            )}
            {template.custom_checkbox1_state && (
                <div>
                    <label>{template.custom_checkbox1_question}</label>
                    <input
                        type="checkbox"
                        name="checkbox1_answer"
                        checked={formData.checkbox1_answer}
                        onChange={handleChange}
                    />
                </div>
            )}
            <button type="submit">Submit</button>
        </form>
    );
}

export default FillForm;