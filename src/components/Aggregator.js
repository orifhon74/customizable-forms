// src/components/Aggregator.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Table } from 'react-bootstrap';

function Aggregator() {
    const { templateId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAgg = async () => {
            try {
                const resp = await fetch(`http://localhost:5001/api/templates/${templateId}/aggregate`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) throw new Error('Failed to fetch aggregator');
                const result = await resp.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchAgg();
    }, [templateId, token]);

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!data) return <div>Loading aggregator...</div>;

    return (
        <div className="mt-3">
            <h2>Aggregation for Template #{templateId}</h2>
            <p>Total Forms: {data.total_forms}</p>
            <h4>Averages of integer answers</h4>
            <Table bordered>
                <thead>
                <tr>
                    <th>Field</th>
                    <th>Average</th>
                </tr>
                </thead>
                <tbody>
                {Object.keys(data.averages).map((field) => (
                    <tr key={field}>
                        <td>{field}</td>
                        <td>{data.averages[field]}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <h4>Most Common Strings</h4>
            <Table bordered>
                <thead>
                <tr>
                    <th>Field</th>
                    <th>Most Common</th>
                </tr>
                </thead>
                <tbody>
                {Object.keys(data.commonStrings).map((field) => (
                    <tr key={field}>
                        <td>{field}</td>
                        <td>{data.commonStrings[field] || 'N/A'}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}

export default Aggregator;