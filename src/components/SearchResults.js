import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';

function SearchResults() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    const searchType = queryParams.get('type') || 'text'; // Default to text search

    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const doSearch = async () => {
            if (!searchQuery) return;

            try {
                const url =
                    searchType === 'tag'
                        ? `http://localhost:5001/api/templates/search?tag=${searchQuery.toLowerCase()}`
                        : `http://localhost:5001/api/templates/search?query=${searchQuery}`;
                const resp = await fetch(url);
                if (!resp.ok) throw new Error('Search failed');
                const data = await resp.json();
                setResults(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        doSearch();
    }, [searchQuery, searchType]);

    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="mt-4">
            <h2>Search Results for: {searchQuery}</h2>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <Row>
                    {results.map((tmpl) => (
                        <Col md={4} key={tmpl.id} className="mb-3">
                            <Card>
                                {tmpl.image_url && (
                                    <Card.Img
                                        variant="top"
                                        src={tmpl.image_url}
                                        style={{ objectFit: 'cover', height: '200px' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{tmpl.title}</Card.Title>
                                    <Card.Text>{tmpl.description}</Card.Text>
                                    {tmpl.Tags && tmpl.Tags.length > 0 && (
                                        <p>
                                            <strong>Tags:</strong> {tmpl.Tags.map((tag) => tag.name).join(', ')}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Author:</strong> {tmpl.user_id}
                                    </p>
                                    <a href={`/templates/${tmpl.id}`} className="btn btn-primary">
                                        View Details
                                    </a>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}

export default SearchResults;