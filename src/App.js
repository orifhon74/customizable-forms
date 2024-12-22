import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Templates from './components/Templates';
import Forms from './components/Forms';
import Login from './components/Login';
import Register from './components/Register';
import TemplateForm from './components/TemplateForm';
import FormSubmission from './components/FormSubmission';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Check if token exists and validate it
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user')); // Assuming user info is stored

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
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="/">Customizable Forms</a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mr-auto">
                            {!isAuthenticated ? (
                                <>
                                    <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                                </>
                            ) : (
                                <>
                                    {userRole === 'admin' && (
                                        <li className="nav-item"><Link className="nav-link" to="/admin">Admin Panel</Link></li>
                                    )}
                                    <li className="nav-item"><Link className="nav-link" to="/templates">Templates</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/forms">Forms</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/create-template">Create Template</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/submit-form/1">Submit Form</Link></li> {/* Replace 1 with dynamic template ID */}
                                    <li className="nav-item">
                                        <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/admin"
                        element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
                    />
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
                        path="/submit-form/:id"
                        element={isAuthenticated ? <FormSubmission /> : <Navigate to="/login" />}
                    />
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