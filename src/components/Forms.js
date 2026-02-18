// src/components/Forms.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { FileText, Search, ArrowRight, Loader2 } from "lucide-react";

function Forms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState("");

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchForms = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found. Please log in.");

                const response = await fetch(`${API_URL}/api/forms`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch forms (HTTP ${response.status})`);
                }

                const data = await response.json();
                setForms(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Failed to fetch forms");
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, [API_URL]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return forms;

        return forms.filter((f) => {
            const templateTitle = f.Template?.title?.toLowerCase() || "";
            const username = f.User?.username?.toLowerCase() || "";
            const idStr = String(f.id || "");
            return templateTitle.includes(q) || username.includes(q) || idStr.includes(q);
        });
    }, [forms, query]);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Submitted Forms</h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Review form submissions and open details.
                    </p>
                </div>

                <div className="relative w-full sm:w-[320px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by template, user, or ID..."
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    <div className="font-medium">Couldn’t load forms</div>
                    <div className="mt-1 opacity-90">{error}</div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading forms...
                    </div>

                    {/* Skeleton rows */}
                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900"
                            />
                        ))}
                    </div>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
                <Card className="p-10">
                    <div className="mx-auto max-w-md text-center">
                        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">No forms found</h2>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {forms.length === 0
                                ? "No one has submitted any forms yet."
                                : "Try a different search query."}
                        </p>
                    </div>
                </Card>
            )}

            {/* Table */}
            {!loading && !error && filtered.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Template</th>
                                <th className="px-4 py-3">Submitted By</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filtered.map((form) => (
                                <tr key={form.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {form.Template?.title || "N/A"}
                                        </div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Form ID: {form.id}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {form.User?.username || "N/A"}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                                        {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "—"}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="outline" size="sm" className="gap-2">
                                            <Link to={`/forms/${form.id}`}>
                                                View
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <span>
              Showing <span className="font-medium">{filtered.length}</span> of{" "}
                <span className="font-medium">{forms.length}</span>
            </span>
                        <span className="hidden sm:inline">
              Tip: search by template name, username, or ID.
            </span>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default Forms;