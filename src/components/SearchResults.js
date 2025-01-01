import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';

function SearchResults() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';

    const [results, setResults] = useState([]);

    useEffect(() => {
        const doSearch = async () => {
            if (!searchQuery) return;
            try {
                const resp = await fetch(`http://localhost:5001/api/templates/search?query=${searchQuery}`);
                if (!resp.ok) throw new Error('Search failed');
                const data = await resp.json();
                setResults(data);
            } catch (err) {
                console.error(err);
            }
        };
        doSearch();
    }, [searchQuery]);

    return (
        <div className="mt-4">
            <h2>Search Results for: {searchQuery}</h2>
            <Row>
                {results.map((tmpl) => (
                    <Col md={4} key={tmpl.id} className="mb-3">
                        <Card>
                            {tmpl.image_url && (
                                <Card.Img variant="top" src={tmpl.image_url} style={{ objectFit: 'cover', height: '200px' }} />
                            )}
                            <Card.Body>
                                <Card.Title>{tmpl.title}</Card.Title>
                                <Card.Text>{tmpl.description}</Card.Text>
                                <Button href={`/template/${tmpl.id}`} variant="primary">
                                    View
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default SearchResults;