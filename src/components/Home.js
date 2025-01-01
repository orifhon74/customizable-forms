import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const [latestTemplates, setLatestTemplates] = useState([]);
    const [topTemplates, setTopTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);

    const [templates, setTemplates] = useState([]);
    const isAuthenticated = !!localStorage.getItem('token');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Fetch latest templates
                let resp = await fetch('http://localhost:5001/api/templates/latest');
                if (!resp.ok) throw new Error('Failed to fetch latest templates');
                let data = await resp.json();
                setLatestTemplates(data);

                // Fetch top 5 templates
                resp = await fetch('http://localhost:5001/api/templates/top');
                if (!resp.ok) throw new Error('Failed to fetch top templates');
                data = await resp.json();
                setTopTemplates(data);

                // Fetch tag cloud
                resp = await fetch('http://localhost:5001/api/tags/cloud');
                if (!resp.ok) throw new Error('Failed to fetch tag cloud');
                data = await resp.json();
                setTags(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchHomeData();
    }, []);

    const handleTagClick = (tagName) => {
        navigate(`/search-results?q=${tagName}`);
    };

    const handleLike = async (templateId) => {
        if (!isAuthenticated) {
            setError('You must be logged in to like a template');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5001/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ template_id: templateId }),
            });
            if (!response.ok) throw new Error('Failed to like template');
            const updatedTemplates = templates.map((template) =>
                template.id === templateId
                    ? { ...template, likeCount: (template.likeCount || 0) + 1 }
                    : template
            );
            setTemplates(updatedTemplates);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ margin: '20px' }}>
            <h1>Home</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <section>
                <h2>Latest Templates</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {latestTemplates.map((template) => (
                        <div
                            key={template.id}
                            style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                borderRadius: '5px',
                                width: '250px',
                            }}
                        >
                            <h3>{template.title}</h3>
                            <p>{template.description}</p>
                            {template.image_url && (
                                <img
                                    src={template.image_url}
                                    alt={template.title}
                                    style={{width: '100%', height: '150px', objectFit: 'cover'}}
                                />
                            )}
                            <p>
                                <strong>Author:</strong> {template.user_id}
                            </p>
                            <p>Likes: {template.likeCount || 0}</p>
                            <button onClick={() => handleLike(template.id)}>Like</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/templates/${template.id}`)}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2>Top 5 Most Popular</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {topTemplates.map((template) => (
                        <div
                            key={template.id}
                            style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                borderRadius: '5px',
                                width: '250px',
                            }}
                        >
                            <h3>{template.title}</h3>
                            <p>{template.description}</p>
                            {template.image_url && (
                                <img
                                    src={template.image_url}
                                    alt={template.title}
                                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                />
                            )}
                            <p>
                                <strong>Forms Filled:</strong> {template.forms_count}
                            </p>
                            <p>Likes: {template.likeCount || 0}</p>
                            <button onClick={() => handleLike(template.id)}>Like</button>
                            <Link to={`/templates/${template.id}`}>
                                <button>View Details</button>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2>Tag Cloud</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {tags.map((tag) => (
                        <span
                            key={tag.name}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '15px',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleTagClick(tag.name)}
                        >
                            {tag.name} ({tag.count})
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;