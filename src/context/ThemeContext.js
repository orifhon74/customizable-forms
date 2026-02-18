// src/context/ThemeContext.js
import React, { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext();

const STORAGE_KEY = "theme"; // optional persistence

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "dark" || saved === "light" ? saved : "dark"; // default dark 😈
    });

    useEffect(() => {
        const root = document.documentElement; // <html>

        // Tailwind expects this:
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");

        // If you still want body class for legacy CSS, keep it too:
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);

        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

    const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}