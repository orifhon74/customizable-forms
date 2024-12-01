import { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/`)
            .then((response) => response.text())
            .then((data) => setMessage(data));
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}

export default App;