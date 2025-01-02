import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function TemplateDetails() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);
    const [error, setError] = useState(null);
    const [likeDisabled, setLikeDisabled] = useState(false); // For disabling like button
    const [commentContent, setCommentContent] = useState(''); // Controlled input for comment

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
                setLikes(data.likeCount || 0);

                // Fetch comments
                const commentsResp = await fetch(`http://localhost:5001/api/comments/${id}`);
                const commentsData = await commentsResp.json();
                setComments(commentsData);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        };

        fetchTemplateDetails();
    }, [id]);

    const handleLike = async () => {
        if (!localStorage.getItem('token')) {
            setError('You must be logged in to like a template.');
            return;
        }

        try {
            setLikeDisabled(true); // Disable button to prevent multiple clicks
            const resp = await fetch(`http://localhost:5001/api/likes`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ template_id: id }),
            });
            if (!resp.ok) throw new Error('Failed to like template');
            setLikes((prevLikes) => prevLikes + 1);
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        } finally {
            setLikeDisabled(false);
        }
    };

    const handleAddComment = async () => {
        if (!localStorage.getItem('token')) {
            setError('You must be logged in to comment.');
            return;
        }

        if (!commentContent.trim()) {
            setError('Comment content cannot be empty.');
            return;
        }

        try {
            const resp = await fetch(`http://localhost:5001/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ template_id: id, content: commentContent }),
            });
            if (!resp.ok) throw new Error('Failed to add comment');
            const newComment = await resp.json();
            setComments((prevComments) => [newComment, ...prevComments]);
            setCommentContent(''); // Clear the input field
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }
    };

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!template) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{template.title}</h1>
            <p>{template.description}</p>
            <p>
                <strong>Tags:</strong> {template.Tags?.length > 0 ? template.Tags.map((tag) => tag.name).join(', ') : 'No tags'}
            </p>
            <p>Likes: {likes}</p>
            <button onClick={handleLike} disabled={likeDisabled}>
                {likeDisabled ? 'Liking...' : 'Like'}
            </button>

            <h3>Questions: </h3>
            <div>
                <h4>String Questions</h4>
                <ul>
                    {Array.from({length: 4}).map((_, index) => {
                        const question = template[`custom_string${index + 1}_question`];
                        const state = template[`custom_string${index + 1}_state`];
                        return state && question ? <li key={index}>{question}</li> : null;
                    })}
                </ul>

                <h4>Multiline Questions</h4>
                <ul>
                    {Array.from({length: 4}).map((_, index) => {
                        const question = template[`custom_multiline${index + 1}_question`];
                        const state = template[`custom_multiline${index + 1}_state`];
                        return state && question ? <li key={index}>{question}</li> : null;
                    })}
                </ul>

                <h4>Integer Questions</h4>
                <ul>
                    {Array.from({length: 4}).map((_, index) => {
                        const question = template[`custom_int${index + 1}_question`];
                        const state = template[`custom_int${index + 1}_state`];
                        return state && question ? <li key={index}>{question}</li> : null;
                    })}
                </ul>

                <h4>Checkbox Questions</h4>
                <ul>
                    {Array.from({length: 4}).map((_, index) => {
                        const question = template[`custom_checkbox${index + 1}_question`];
                        const state = template[`custom_checkbox${index + 1}_state`];
                        return state && question ? <li key={index}>{question}</li> : null;
                    })}
                </ul>
            </div>

            {/*/!* Add TemplateStats *!/*/}
            {/*<TemplateStats templateId={id} />*/}

            <h3>Comments: </h3>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        <strong>{comment.User?.username || 'Anonymous'}:</strong> {comment.content}
                    </li>
                ))}
            </ul>

            <div style={{marginTop: '20px'}}>
                <textarea
                    placeholder="Add a comment"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    style={{width: '100%', height: '100px'}}
                />
                <button onClick={handleAddComment} style={{marginTop: '10px'}}>
                    Submit Comment
                </button>
            </div>
        </div>
    );
}

export default TemplateDetails;