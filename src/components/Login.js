// src/components/Login.js
import React, { useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { AlertTriangle, LogIn } from "lucide-react";

function Login({ setIsAuthenticated, setUserRole }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const { t } = useContext(LanguageContext);

    const canSubmit = useMemo(() => {
        return email.trim().length > 0 && password.trim().length > 0 && !loading;
    }, [email, password, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // invalid credentials or user is blocked
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setIsAuthenticated(true);
            setUserRole(data.user.role);

            navigate(data.user.role === "admin" ? "/admin" : "/templates");
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] px-4 py-10">
            <div className="mx-auto w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">{t("login") || "Login"}</h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Enter your credentials to continue.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        <div className="flex items-center gap-2 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    </div>
                )}

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
                            <LogIn className="h-4 w-4" />
                            {loading ? "Signing in..." : (t("login") || "Login")}
                        </Button>

                        <Separator />

                        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            {t("noAccount") || "No account?"}{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80 dark:text-zinc-100"
                            >
                                {t("register") || "Register"}
                            </button>
                        </div>
                    </form>
                </Card>

                {/*<p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">*/}
                {/*    Tip: If login fails, check that your backend URL is correct in{" "}*/}
                {/*    <span className="font-mono">REACT_APP_API_URL</span>.*/}
                {/*</p>*/}
            </div>
        </div>
    );
}

export default Login;