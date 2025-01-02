import React, { useContext, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaSignOutAlt, FaUserCircle, FaMoon, FaSun, FaLanguage } from 'react-icons/fa';

function NavBar({ isAuthenticated, userRole, handleLogout }) {
    const { t, language, switchLanguage } = useContext(LanguageContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

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
            className="mb-3 shadow-sm"
        >
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    {t('appTitle') || 'Customizable Forms'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated ? (
                            <>
                                {userRole === 'admin' && (
                                    <NavDropdown title="Admin" id="admin-dropdown">
                                        <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/users">{t('userManagement')}</NavDropdown.Item>
                                    </NavDropdown>
                                )}
                                <Nav.Link as={Link} to="/public-templates">{t('publicTemplates') || 'Public Templates'}</Nav.Link>
                                <Nav.Link as={Link} to="/templates">{t('templates')}</Nav.Link>
                                <Nav.Link as={Link} to="/forms">{t('forms')}</Nav.Link>
                                <Nav.Link as={Link} to="/create-template">{t('createTemplate')}</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">{t('login') || 'Sign In'}</Nav.Link>
                                <Nav.Link as={Link} to="/register">{t('register') || 'Sign Out'}</Nav.Link>
                                <Nav.Link as={Link} to="/public-templates">{t('publicTemplates') || 'Public Templates'}</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Form className="d-flex me-3" onSubmit={handleSearchSubmit}>
                        <Form.Control
                            type="search"
                            placeholder="Search..."
                            className="me-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="outline-success" type="submit">
                            <FaSearch />
                        </Button>
                    </Form>
                    <Nav className="ms-auto align-items-center">
                        <NavDropdown
                            title={<FaLanguage />}
                            id="lang-dropdown"
                            align="end"
                            className="d-inline-block me-3"
                        >
                            <NavDropdown.Item onClick={() => switchLanguage('en')}>EN</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => switchLanguage('uz')}>UZ</NavDropdown.Item>
                        </NavDropdown>
                        <Button
                            variant="outline-secondary"
                            className="me-3 d-inline-block"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <FaSun /> : <FaMoon />}
                        </Button>
                        {isAuthenticated && (
                            <NavDropdown
                                title={<FaUserCircle />}
                                id="user-dropdown"
                                align="end"
                                className="d-inline-block"
                            >
                                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    <FaSignOutAlt /> {t('logout')}
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;