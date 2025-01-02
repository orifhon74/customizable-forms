import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';


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
        <Container className="my-4">
            <h2 className="text-center mb-4">
                Search Results {searchType === 'tag' ? `for Tag ID: ${searchQuery}` : `for: "${searchQuery}"`}
            </h2>
            {results.length === 0 ? (
                <Alert variant="info">No results found.</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {results.map((template) => (
                        <Col key={template.id}>
                            <Card className="shadow-sm">
                                {template.image_url && (
                                    <Card.Img
                                        variant="top"
                                        src={template.image_url}
                                        alt={template.title}
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{template.title}</Card.Title>
                                    <Card.Text>{template.description}</Card.Text>
                                    <div className="d-flex justify-content-center">
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/templates/${template.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}

export default SearchResults;