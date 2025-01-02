import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SearchResults() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    const searchType = queryParams.get('type') || 'text';

    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery) return;

            try {
                let url = `${API_URL}/api/templates/search`;

                if (searchType === 'tag') {
                    url += `?tag=${searchQuery}`; // Pass the tag name
                } else {
                    url += `?query=${searchQuery}`; // Pass the text query
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();
                setResults(data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch search results.');
            }
        };

        fetchSearchResults();
    }, [searchQuery, searchType]);

    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Search Results </h2>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {results.map((template) => (
                        <div
                            key={template.id}
                            style={{
                                border: '1px solid #ccc',
                                padding: '20px',
                                borderRadius: '8px',
                                width: '250px',
                            }}
                        >
                            <h3>{template.title}</h3>
                            <p>{template.description}</p>
                            <button
                                onClick={() => window.location.href = `/templates/${template.id}`}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResults;