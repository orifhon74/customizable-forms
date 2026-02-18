// src/components/UserDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, FileText, LayoutTemplate, ArrowRight } from "lucide-react";

function UserDashboard() {
    const [templates, setTemplates] = useState([]);
    const [forms, setForms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!token) throw new Error("No token found. Please log in.");

                const [tplRes, formRes] = await Promise.all([
                    fetch(`${API_URL}/api/templates`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_URL}/api/forms`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!tplRes.ok) throw new Error("Failed to fetch templates");
                if (!formRes.ok) throw new Error("Failed to fetch forms");

                const [tplData, formData] = await Promise.all([tplRes.json(), formRes.json()]);

                setTemplates(Array.isArray(tplData) ? tplData : []);
                setForms(Array.isArray(formData) ? formData : []);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [API_URL]);

    const stats = useMemo(
        () => [
            {
                label: "Your Templates",
                value: templates.length,
                icon: LayoutTemplate,
                action: () => navigate("/templates"),
                actionLabel: "Manage",
            },
            {
                label: "Your Forms",
                value: forms.length,
                icon: FileText,
                action: () => navigate("/forms"),
                actionLabel: "View",
            },
        ],
        [templates.length, forms.length, navigate]
    );

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="space-y-4">
                    <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                        <div className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Quick overview of your templates and submitted forms.
                    </p>
                </div>

                <Button onClick={() => navigate("/create-template")} className="shrink-0">
                    Create Template <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                    </div>
                </div>
            )}

            {/* Stat tiles */}
            <div className="grid gap-4 md:grid-cols-2">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <Card key={s.label} className="overflow-hidden">
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.label}</p>
                                    <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                                        {s.value}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <Button variant="outline" onClick={s.action}>
                                        {s.actionLabel}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Content grids */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* Templates */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Your Templates</CardTitle>
                        <Button variant="ghost" onClick={() => navigate("/templates")}>
                            See all
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {templates.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                                You haven’t created any templates yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {templates.slice(0, 5).map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => navigate(`/template/${tpl.id}`)}
                                        className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                                    {tpl.title}
                                                </div>
                                                <div className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {tpl.description || "No description"}
                                                </div>
                                            </div>
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Forms */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Your Forms</CardTitle>
                        <Button variant="ghost" onClick={() => navigate("/forms")}>
                            See all
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {forms.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                                You haven’t submitted any forms yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {forms.slice(0, 5).map((form) => (
                                    <button
                                        key={form.id}
                                        onClick={() => navigate(`/forms/${form.id}`)}
                                        className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                                    Form #{form.id}
                                                </div>
                                                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                                    Submitted:{" "}
                                                    {form.createdAt
                                                        ? new Date(form.createdAt).toLocaleDateString()
                                                        : "N/A"}
                                                </div>
                                            </div>
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default UserDashboard;