// src/components/Register.js
import React, { useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { AlertTriangle, UserPlus } from "lucide-react";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const { t } = useContext(LanguageContext);

    const canSubmit = useMemo(() => {
        return (
            username.trim().length > 0 &&
            email.trim().length > 0 &&
            password.trim().length > 0 &&
            !loading
        );
    }, [username, email, password, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                // If backend returns {error: "..."} use it, else fallback
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to register. Please try again.");
            }

            navigate("/login");
        } catch (err) {
            setError(err.message || "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] px-4 py-10">
            <div className="mx-auto w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {t("register") || "Register"}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Create an account to build templates and submit forms.
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
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                type="text"
                                placeholder="orifhon74"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

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
                                autoComplete="new-password"
                                required
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Keep it simple for MVP. You can add password rules later.
                            </p>
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
                            <UserPlus className="h-4 w-4" />
                            {loading ? "Creating account..." : (t("register") || "Register")}
                        </Button>

                        <Separator />

                        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            {t("yesAccount") || "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80 dark:text-zinc-100"
                            >
                                {t("login") || "Login"}
                            </button>
                        </div>
                    </form>
                </Card>

                {/*<p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">*/}
                {/*    If registration fails, confirm your backend URL in{" "}*/}
                {/*    <span className="font-mono">REACT_APP_API_URL</span>.*/}
                {/*</p>*/}
            </div>
        </div>
    );
}

export default Register;