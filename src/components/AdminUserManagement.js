// src/components/AdminUserManagement.js
import React, { useEffect, useState } from 'react';

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5001/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            if (!response.ok) {
                throw new Error('Failed to update role');
            }
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleBlockUser = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}/block`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to block/unblock user');
            }
            fetchUsers();
        } catch (err) {
            console.error(err.message);
        }
    };

    const deleteUser = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ margin: '20px' }}>
            <h1>Admin User Management</h1>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.deletedAt ? 'Blocked' : 'Active'}</td>
                        <td>
                            <button onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}>
                                {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            </button>
                            <button onClick={() => toggleBlockUser(user.id)}>
                                {user.deletedAt ? 'Unblock' : 'Block'}
                            </button>
                            <button onClick={() => deleteUser(user.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserManagement;