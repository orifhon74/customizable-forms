import { useEffect, useState } from 'react';

function App() {
    const [users, setUsers] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Fallback for local dev

    useEffect(() => {
        fetch(`${apiUrl}/api/users`) // Replace with a valid endpoint
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setUsers(data))
            .catch((error) => console.error('Error fetching API:', error));
    }, []);

    return (
        <div>
            <h1>Users:</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;

// import { useState } from 'react';
//
// function App() {
//     const [message, setMessage] = useState('Welcome to the App!');
//
//     return (
//         <div>
//             <h1>{message}</h1>
//         </div>
//     );
// }
//
// export default App;