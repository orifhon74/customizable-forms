// src/components/AppLayout.jsx
import React from "react";
import NavBar from "./NavBar";

export default function AppLayout({ children, isAuthenticated, userRole, handleLogout }) {
    return (
        <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
            <NavBar
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                handleLogout={handleLogout}
            />
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}