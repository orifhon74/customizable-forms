// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home';
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
import EditForm from './components/EditForm';
import TemplateDetails from './components/TemplateDetails';
import SearchResults from './components/SearchResults';
import NavBar from './components/NavBar';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import FormDetails from "./components/FormDetails";

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
        <LanguageProvider>
            <ThemeProvider>
                <Router>
                    <div>
                        {/* Navigation Bar */}
                        <NavBar
                            isAuthenticated={isAuthenticated}
                            userRole={userRole}
                            handleLogout={handleLogout}
                        />

                        {/* Routes */}
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/login"
                                element={
                                    <Login
                                        setIsAuthenticated={setIsAuthenticated}
                                        setUserRole={setUserRole}
                                    />
                                }
                            />
                            <Route path="/register" element={<Register />} />
                            <Route path="/public-templates" element={<PublicTemplates />} />

                            {/* Admin Routes */}
                            <Route
                                path="/admin"
                                element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    userRole === 'admin' ? <AdminUserManagement /> : <Navigate to="/" />
                                }
                            />

                            {/* Authenticated Routes */}
                            <Route
                                path="/templates"
                                element={isAuthenticated ? <Templates /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/template/:id"
                                element={isAuthenticated ? <Templates /> : <Navigate to="/login" />}
                            />
                            <Route path="/templates/:id" element={<TemplateDetails />} />
                            <Route
                                path="/forms"
                                element={isAuthenticated ? <Forms /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/forms/:formId"
                                element={isAuthenticated ? <FormDetails /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/create-template"
                                element={isAuthenticated ? <TemplateForm /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/submit-form/:templateId"
                                element={isAuthenticated ? <FormSubmission /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/edit-form/:formId"
                                element={isAuthenticated ? <EditForm /> : <Navigate to="/login" />}
                            />

                            {/* Search Results Page */}
                            <Route path="/search-results" element={<SearchResults />} />

                            {/* Dashboard Route */}
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
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default App;