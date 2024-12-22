import React, { useEffect, useState } from 'react';

function TemplateList() {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5001/api/templates') // Adjust API URL as needed
            .then((res) => res.json())
            .then((data) => setTemplates(data))
            .catch((err) => console.error('Error fetching templates:', err));
    }, []);

    return (
        <div>
            <h1>Templates</h1>
            <ul>
                {templates.map((template) => (
                    <li key={template.id}>
                        <h2>{template.title}</h2>
                        <p>{template.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TemplateList;