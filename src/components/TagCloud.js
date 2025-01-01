import React from 'react';
import { useNavigate } from 'react-router-dom';

function TagCloud({ tags }) {
    const navigate = useNavigate();

    const handleTagClick = (tagName) => {
        navigate(`/search-results?q=${tagName}`);
    };

    return (
        <div>
            <h2>Tag Cloud</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {tags.map((tag) => (
                    <span
                        key={tag.id}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: `${10 + tag.templateCount * 2}px`, // Scale font size by count
                        }}
                        onClick={() => handleTagClick(tag.name)}
                    >
                        {tag.name} ({tag.templateCount})
                    </span>
                ))}
            </div>
        </div>
    );
}

export default TagCloud;