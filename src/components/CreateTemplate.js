import React, { useState } from 'react';

function CreateTemplate() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:5001/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Use the token
            },
            body: JSON.stringify({ title, description, image_url: imageUrl }),
        })
            .then((res) => res.json())
            .then((data) => console.log('Template created:', data))
            .catch((err) => console.error('Error creating template:', err));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Image URL</label>
                <input type="url" className="form-control" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Create Template</button>
        </form>
    );
}

export default CreateTemplate;