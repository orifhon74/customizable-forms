import { useEffect, useState } from 'react';

function App() {
    const [message] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/api/hello`)
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error fetching API:', error));
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}

export default App;