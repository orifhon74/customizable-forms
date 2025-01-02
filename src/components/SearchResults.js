import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SearchResults() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    const searchType = queryParams.get('type') || 'text'; // Default to text search

    const [results, setResults] = useState([]);

    useEffect(() => {
        const doSearch = async () => {
            if (!searchQuery) return;

            try {
                const url =
                    searchType === 'tag'
                        ? `http://localhost:5001/api/tags/by-tag/${searchQuery}`
                        : `http://localhost:5001/api/templates/search?query=${searchQuery}`;
                const resp = await fetch(url);
                if (!resp.ok) throw new Error('Search failed');
                const data = await resp.json();
                setResults(data);
            } catch (err) {
                console.error(err);
            }
        };

        doSearch();
    }, [searchQuery, searchType]);

    return (
        <div>
            <h2>Search Results for: {searchQuery}</h2>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                results.map((tmpl) => (
                    <div key={tmpl.id}>
                        <h3>{tmpl.title}</h3>
                        <p>{tmpl.description}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default SearchResults;