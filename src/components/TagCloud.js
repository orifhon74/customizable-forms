import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TagCloud() {
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTagCloud = async () => {
            try {
                const resp = await fetch('http://localhost:5001/api/tags/cloud');
                if (!resp.ok) throw new Error('Failed to fetch tag cloud');
                const data = await resp.json();
                setTags(data);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        };

        fetchTagCloud();
    }, []);

    const handleTagClick = (tagName) => {
        navigate(`/search-results?q=${tagName}`);
    };

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="tag-cloud">
            <h3>Tag Cloud</h3>
            {tags.map((tag) => (
                <span
                    key={tag.id}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        margin: '5px',
                    }}
                    onClick={() => handleTagClick(tag.name)}
                >
                    {tag.name} ({tag.templateCount})
                </span>
            ))}
        </div>
    );
}

export default TagCloud;