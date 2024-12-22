import React, { useEffect, useState } from 'react';

function TemplateStats({ templateId }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5001/api/templates/${templateId}/stats`)
            .then((res) => res.json())
            .then((data) => setStats(data[0])) // Assuming stats is an array with one object
            .catch((err) => console.error('Error fetching stats:', err));
    }, [templateId]);

    if (!stats) {
        return <p>Loading stats...</p>;
    }

    return (
        <div>
            <h1>Template Statistics</h1>
            <p>Average for Question 1 (Int): {stats.avg_int1}</p>
            <p>Total Responses to Checkbox 1: {stats.checkbox1_count}</p>
            <p>Total "Yes" for Checkbox 1: {stats.checkbox1_true_count}</p>
        </div>
    );
}

export default TemplateStats;