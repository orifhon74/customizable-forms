import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import UserDashboard from './components/UserDashboard';
import Templates from './components/Templates';
import PublicTemplates from './components/PublicTemplates';
import TemplateForm from './components/TemplateForm';
import FormSubmission from './components/FormSubmission';
import Forms from './components/Forms';
import Login from './components/Login';
import Register from './components/Register';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Check if user is authenticated and their role
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            setIsAuthenticated(true);
            setUserRole(user.role);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <Router>
            <div>
                {/* Navigation Bar */}
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="/">Customizable Forms</a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mr-auto">
                            {!isAuthenticated ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/register">Register</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/public-templates">Public Templates</Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {userRole === 'admin' && (
                                        <>
                                            <li className="nav-item">
                                                <Link className="nav-link" to="/admin">Admin Dashboard</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className="nav-link" to="/admin/users">User Management</Link>
                                            </li>
                                        </>
                                    )}
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/public-templates">Public Templates</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/templates">Templates</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/forms">Forms</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/create-template">Create Template</Link>
                                    </li>
                                    <li className="nav-item">
                                        <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/public-templates" element={<PublicTemplates />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
                    <Route path="/admin/users" element={userRole === 'admin' ? <AdminUserManagement /> : <Navigate to="/" />} />

                    {/* Authenticated Routes */}
                    <Route
                        path="/templates"
                        element={isAuthenticated ? <Templates /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/forms"
                        element={isAuthenticated ? <Forms /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/create-template"
                        element={isAuthenticated ? <TemplateForm /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/submit-form/:templateId"
                        element={isAuthenticated ? <FormSubmission /> : <Navigate to="/login" />}
                    />
                    {/*<Route*/}
                    {/*    path="/template/:id"*/}
                    {/*    element={isAuthenticated ? <TemplateDetails /> : <Navigate to="/login" />}*/}
                    {/*/>*/}

                    <Route
                        path="/template/:id"
                        element={
                            isAuthenticated ? (
                                <Templates />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />

                    {/* Default Dashboard Route */}
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated ? (
                                userRole === 'admin' ? (
                                    <Navigate to="/admin" />
                                ) : (
                                    <UserDashboard />
                                )
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;