import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function TemplateDetails() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplateDetails = async () => {
            try {
                const resp = await fetch(`http://localhost:5001/api/templates/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!resp.ok) throw new Error('Failed to fetch template details');
                const data = await resp.json();

                setTemplate(data);
                setComments(data.Comments || []);
                setLikes(data.likeCount || 0);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        };

        fetchTemplateDetails();
    }, [id]);

    const handleLike = async () => {
        try {
            const resp = await fetch(`http://localhost:5001/api/likes/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!resp.ok) throw new Error('Failed to like template');
            setLikes((prevLikes) => prevLikes + 1);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleAddComment = async (comment) => {
        try {
            const resp = await fetch(`http://localhost:5001/api/comments/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ content: comment }),
            });
            if (!resp.ok) throw new Error('Failed to add comment');
            const newComment = await resp.json();
            setComments((prevComments) => [...prevComments, newComment]);
        } catch (err) {
            console.error(err.message);
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
            <h1>{template.title}</h1>
            <p>{template.description}</p>
            <p>Tags: {template.Tags?.map((tag) => tag.name).join(', ')}</p>
            <p>Likes: {likes}</p>
            <button onClick={handleLike}>Like</button>

            <h3>Comments</h3>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        <strong>User {comment.user_id}:</strong> {comment.content}
                    </li>
                ))}
            </ul>

            <div>
                <textarea
                    placeholder="Add a comment"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(e.target.value);
                            e.target.value = '';
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default TemplateDetails;