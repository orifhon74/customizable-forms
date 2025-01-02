import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert, Spinner } from 'react-bootstrap';

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
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
            const response = await fetch(`${API_URL}/api/users/${userId}/block`, {
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
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
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

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">Error: {error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h1 className="text-center mb-4">Admin User Management</h1>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Loading users...</p>
                </div>
            ) : (
                <Table responsive bordered hover className="shadow-sm table-dark">
                    <thead className="table-light text-dark">
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
                                <Button
                                    variant={user.role === 'admin' ? 'warning' : 'success'}
                                    size="sm"
                                    onClick={() =>
                                        updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')
                                    }
                                    className="me-2"
                                >
                                    {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                </Button>
                                <Button
                                    variant={user.deletedAt ? 'success' : 'danger'}
                                    size="sm"
                                    onClick={() => toggleBlockUser(user.id)}
                                    className="me-2"
                                >
                                    {user.deletedAt ? 'Unblock' : 'Block'}
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => deleteUser(user.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default AdminUserManagement;