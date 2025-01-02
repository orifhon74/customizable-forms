import React, { useEffect, useState } from 'react';

function TemplateStats({ templateId }) {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Unauthorized: No token found');

                const res = await fetch(`http://localhost:5001/api/aggregator/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error(`Error fetching stats: ${res.statusText}`);
                }

                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        };

        fetchStats();
    }, [templateId]);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!stats) return <p>Loading statistics...</p>;

    return (
        <div>
            <h2>Template Statistics</h2>
            <p><strong>Total Forms Submitted:</strong> {stats.total_forms}</p>

            <h3>Average Values (Numeric Fields)</h3>
            <ul>
                {Object.entries(stats.averages).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key.replace('_answer', '').replace('custom_', '')}:</strong> {value !== null ? value.toFixed(2) : 'N/A'}
                    </li>
                ))}
            </ul>

            <h3>Most Common Answers (String Fields)</h3>
            <ul>
                {Object.entries(stats.commonStrings).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key.replace('_answer', '').replace('custom_', '')}:</strong> {value || 'N/A'}
                    </li>
                ))}
            </ul>

            <h3>Checkbox Statistics</h3>
            <ul>
                {Object.entries(stats.checkboxStats).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key.replace('_answer', '').replace('custom_', '')}:</strong>
                        True: {value.true}, False: {value.false}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TemplateStats;