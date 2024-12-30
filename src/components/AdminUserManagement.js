import React, { useEffect, useState } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            if (!response.ok) throw new Error('Failed to update role');
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleBlockUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}/block`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to block/unblock user');
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete user');
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="mt-3">
            <h1>User Management</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover responsive className="mt-3">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status (Blocked?)</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.deletedAt ? 'Blocked' : 'Active'}</td>
                        <td>
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                className="me-2"
                            >
                                {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </Button>
                            <Button
                                variant={u.deletedAt ? 'success' : 'warning'}
                                size="sm"
                                onClick={() => toggleBlockUser(u.id)}
                                className="me-2"
                            >
                                {u.deletedAt ? 'Unblock' : 'Block'}
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteUser(u.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}

export default AdminUserManagement;