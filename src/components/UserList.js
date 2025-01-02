import React, { useEffect, useState } from 'react';

function UserList() {
    const [users, setUsers] = useState([]);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/api/users`) // Adjust for production backend
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error('Error fetching users:', err));
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

export default UserList;