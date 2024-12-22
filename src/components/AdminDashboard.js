import React, { useEffect, useState } from 'react';

function AdminDashboard() {
    const [users, setUsers] = useState([]); // Ensure the state is initialized as an array
    const [error, setError] = useState(''); // For capturing errors

    useEffect(() => {
        // Fetch the users with authorization header
        fetch('/api/users', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Use token stored in localStorage
            },
        })
            .then((response) => {
                if (!response.ok) {
                    // If the response is not OK, capture the error
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('API response:', data); // Log the API response for debugging
                if (Array.isArray(data)) {
                    setUsers(data); // Ensure we set the users only if data is an array
                } else {
                    setError('Unexpected response format.');
                }
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setError('Failed to fetch users. Please try again later.');
            });
    }, []); // Empty dependency array ensures this runs only once

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {error ? (
                <p className="error">{error}</p> // Display error if it exists
            ) : (
                <div>
                    {Array.isArray(users) && users.length > 0 ? (
                        <ul>
                            {users.map((user) => (
                                <li key={user.id}>
                                    <strong>{user.username}</strong> ({user.email})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No users found.</p> // Fallback if no users are returned
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;