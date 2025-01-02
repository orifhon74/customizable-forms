// src/components/NavBar.js
import React, { useContext, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

function NavBar({ isAuthenticated, userRole, handleLogout }) {
    const { t, language, switchLanguage } = useContext(LanguageContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    // For searching
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        navigate(`/search-results?q=${searchQuery}`);
        setSearchQuery('');
    };

    return (
        <Navbar
            bg={theme === 'dark' ? 'dark' : 'light'}
            variant={theme === 'dark' ? 'dark' : 'light'}
            expand="lg"
            className="mb-3"
        >
            <Container>
                <Navbar.Brand as={Link} to="/">
                    {t('appTitle') || 'Customizable Forms'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar-nav" />
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated ? (
                            <>
                                {userRole === 'admin' && (
                                    <>
                                        <Nav.Link as={Link} to="/admin">
                                            Admin Dashboard
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/admin/users">
                                            User Management
                                        </Nav.Link>
                                    </>
                                )}
                                <Nav.Link as={Link} to="/public-templates">
                                    Public Templates
                                </Nav.Link>
                                <Nav.Link as={Link} to="/templates">
                                    Templates
                                </Nav.Link>
                                <Nav.Link as={Link} to="/forms">
                                    Forms
                                </Nav.Link>
                                <Nav.Link as={Link} to="/create-template">
                                    Create Template
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">
                                    {t('login') || 'Login'}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register">
                                    Register
                                </Nav.Link>
                                <Nav.Link as={Link} to="/public-templates">
                                    Public Templates
                                </Nav.Link>
                            </>
                        )}
                    </Nav>

                    {/* Search form */}
                    <Form className="d-flex me-3" onSubmit={handleSearchSubmit}>
                        <Form.Control
                            type="search"
                            placeholder="Search templates..."
                            className="me-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="outline-success" type="submit">
                            Search
                        </Button>
                    </Form>

                    <Nav>
                        {/* Language dropdown */}
                        <NavDropdown title={language.toUpperCase()} id="lang-dropdown">
                            <NavDropdown.Item onClick={() => switchLanguage('en')}>EN</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => switchLanguage('uz')}>UZ</NavDropdown.Item>
                        </NavDropdown>

                        <Button
                            variant="outline-secondary"
                            className="mx-2"
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </Button>

                        {isAuthenticated && (
                            <Button variant="outline-danger" onClick={handleLogout}>
                                Sign Out
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;