// src/components/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
    return (
        <div style={{ margin: '20px' }}>
            <h1>Admin Dashboard</h1>
            <ul>
                <li>
                    <Link to="/admin/users">User Management</Link>
                </li>
                <li>
                    <Link to="/templates">Templates</Link>
                </li>
                <li>
                    <Link to="/forms">Forms</Link>
                </li>
                <li>
                    <Link to="/create-template">Create Template</Link>
                </li>
            </ul>
        </div>
    );
}

export default AdminDashboard;