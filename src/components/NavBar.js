// src/components/NavBar.js
import React, { useContext, useMemo, useRef, useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";
import { Button } from "./ui/button";

import { Search, LogOut, UserCircle2, Moon, Sun, Languages, ChevronDown, Menu } from "lucide-react";

function useOnClickOutside(ref, handler, when = true) {
    useEffect(() => {
        if (!when) return;

        const listener = (event) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler, when]);
}

function NavBar({ isAuthenticated, userRole, handleLogout }) {
    const { t, switchLanguage } = useContext(LanguageContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState("");

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const userMenuRef = useRef(null);
    const langMenuRef = useRef(null);
    const adminMenuRef = useRef(null);

    const appTitle = useMemo(() => t("appTitle") || "Customizable Forms", [t]);

    // Close menus when route changes (feels “clean”)
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setLangMenuOpen(false);
        setAdminMenuOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, location.search]);

    // Escape closes menus
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setMobileOpen(false);
                setUserMenuOpen(false);
                setLangMenuOpen(false);
                setAdminMenuOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    // Click outside closes menus
    useOnClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen);
    useOnClickOutside(langMenuRef, () => setLangMenuOpen(false), langMenuOpen);
    useOnClickOutside(adminMenuRef, () => setAdminMenuOpen(false), adminMenuOpen);

    const closeAllDropdowns = () => {
        setUserMenuOpen(false);
        setLangMenuOpen(false);
        setAdminMenuOpen(false);
    };

    const openOnly = (menu) => {
        setUserMenuOpen(menu === "user");
        setLangMenuOpen(menu === "lang");
        setAdminMenuOpen(menu === "admin");
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;

        navigate(`/search-results?q=${encodeURIComponent(q)}`);
        setSearchQuery("");
        setMobileOpen(false);
        closeAllDropdowns();
    };

    const linkBase =
        "text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50";
    const linkInactive = "text-zinc-600 dark:text-zinc-400";
    const linkActive = "text-zinc-900 dark:text-zinc-50";

    const navLinkClass = ({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`;

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                {/* Left: Brand + Desktop Nav */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2" onClick={closeAllDropdowns}>
                        {/* A more “logo-ish” mark */}
                        <div className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                            <span className="text-xs font-bold">CF</span>
                        </div>
                        <span className="text-sm font-semibold tracking-tight">{appTitle}</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-4 md:flex">
                        {/*<NavLink to="/" className={navLinkClass} onClick={closeAllDropdowns}>*/}
                        {/*    {t("home") || "Home"}*/}
                        {/*</NavLink>*/}

                        <NavLink to="/public-templates" className={navLinkClass} onClick={closeAllDropdowns}>
                            {t("publicTemplates") || "Public Templates"}
                        </NavLink>

                        {isAuthenticated && (
                            <>
                                <NavLink to="/templates" className={navLinkClass} onClick={closeAllDropdowns}>
                                    {t("templates") || "Templates"}
                                </NavLink>
                                <NavLink to="/forms" className={navLinkClass} onClick={closeAllDropdowns}>
                                    {t("forms") || "Forms"}
                                </NavLink>
                                {/*<NavLink to="/create-template" className={navLinkClass} onClick={closeAllDropdowns}>*/}
                                {/*    {t("createTemplate") || "Create Template"}*/}
                                {/*</NavLink>*/}
                            </>
                        )}

                        {userRole === "admin" && (
                            <div className="relative" ref={adminMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => openOnly(adminMenuOpen ? "none" : "admin")}
                                    className={`${linkBase} ${linkInactive} flex items-center gap-1 rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900`}
                                    aria-expanded={adminMenuOpen}
                                    aria-haspopup="menu"
                                >
                                    Admin <ChevronDown className="h-4 w-4" />
                                </button>

                                {adminMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                                        <button
                                            className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                            onClick={() => {
                                                navigate("/admin");
                                                closeAllDropdowns();
                                            }}
                                        >
                                            Admin Dashboard
                                        </button>
                                        <button
                                            className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                            onClick={() => {
                                                navigate("/admin/users");
                                                closeAllDropdowns();
                                            }}
                                        >
                                            {t("userManagement") || "User Management"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>

                {/* Right: Search + Actions (Desktop) */}
                <div className="hidden items-center gap-2 md:flex">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("search") || "Search..."}
                            className="h-9 w-64 rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                        />
                    </form>

                    {/* Language menu */}
                    <div className="relative" ref={langMenuRef}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOnly(langMenuOpen ? "none" : "lang")}
                            aria-label="Language"
                            aria-expanded={langMenuOpen}
                            className="gap-2"
                        >
                            <Languages className="h-4 w-4" />
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        {langMenuOpen && (
                            <div className="absolute right-0 mt-2 w-32 rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                                <button
                                    className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    onClick={() => {
                                        switchLanguage("en");
                                        closeAllDropdowns();
                                    }}
                                >
                                    EN
                                </button>
                                <button
                                    className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    onClick={() => {
                                        switchLanguage("uz");
                                        closeAllDropdowns();
                                    }}
                                >
                                    UZ
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Theme toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle theme"
                        className="gap-2"
                    >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    {/* Auth actions */}
                    {!isAuthenticated ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                                {t("login") || "Sign In"}
                            </Button>
                            <Button size="sm" onClick={() => navigate("/register")}>
                                {t("register") || "Register"}
                            </Button>
                        </>
                    ) : (
                        <div className="relative" ref={userMenuRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openOnly(userMenuOpen ? "none" : "user")}
                                aria-label="User menu"
                                aria-expanded={userMenuOpen}
                                className="gap-2"
                            >
                                <UserCircle2 className="h-4 w-4" />
                                <ChevronDown className="h-4 w-4" />
                            </Button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                                    <button
                                        className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                        onClick={() => {
                                            navigate("/dashboard");
                                            closeAllDropdowns();
                                        }}
                                    >
                                        {t("dashboard") || "Dashboard"}
                                    </button>

                                    <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

                                    <button
                                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                        onClick={() => {
                                            handleLogout();
                                            closeAllDropdowns();
                                            navigate("/");
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t("logout") || "Logout"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile buttons */}
                <div className="flex items-center gap-2 md:hidden">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Open menu"
                        aria-expanded={mobileOpen}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Mobile panel */}
            {mobileOpen && (
                <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
                    <form onSubmit={handleSearchSubmit} className="relative mb-4">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("search") || "Search..."}
                            className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                        />
                    </form>

                    <div className="flex flex-col gap-3">
                        {/*<NavLink to="/" className={navLinkClass} onClick={() => setMobileOpen(false)}>*/}
                        {/*    {t("home") || "Home"}*/}
                        {/*</NavLink>*/}

                        <NavLink to="/public-templates" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                            {t("publicTemplates") || "Public Templates"}
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink to="/templates" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                                    {t("templates") || "Templates"}
                                </NavLink>
                                <NavLink to="/forms" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                                    {t("forms") || "Forms"}
                                </NavLink>
                                {/*<NavLink to="/create-template" className={navLinkClass} onClick={() => setMobileOpen(false)}>*/}
                                {/*    {t("createTemplate") || "Create Template"}*/}
                                {/*</NavLink>*/}

                                {userRole === "admin" && (
                                    <>
                                        <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                                            Admin Dashboard
                                        </NavLink>
                                        <NavLink to="/admin/users" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                                            {t("userManagement") || "User Management"}
                                        </NavLink>
                                    </>
                                )}

                                <div className="mt-2 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            switchLanguage("en");
                                            setMobileOpen(false);
                                        }}
                                        className="flex-1"
                                    >
                                        EN
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            switchLanguage("uz");
                                            setMobileOpen(false);
                                        }}
                                        className="flex-1"
                                    >
                                        UZ
                                    </Button>
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        handleLogout();
                                        setMobileOpen(false);
                                        navigate("/");
                                    }}
                                    className="mt-2 w-full"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {t("logout") || "Logout"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                                    {t("login") || "Sign In"}
                                </NavLink>
                                <NavLink to="/register" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                                    {t("register") || "Register"}
                                </NavLink>

                                <div className="mt-2 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            switchLanguage("en");
                                            setMobileOpen(false);
                                        }}
                                        className="flex-1"
                                    >
                                        EN
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            switchLanguage("uz");
                                            setMobileOpen(false);
                                        }}
                                        className="flex-1"
                                    >
                                        UZ
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default NavBar;