// src/components/SearchResults.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card } from "./ui/card";
import { Button } from "./ui/button";

import TemplateCard from "./TemplateCard";
import TemplateTagsRow from "./TemplateTagsRow";

import { ArrowLeft, Search, Tag, Loader2 } from "lucide-react";

function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL;

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const searchQuery = queryParams.get("q") || "";
    const searchType = queryParams.get("type") || "text"; // "text" | "tag"

    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const isAuthenticated = useMemo(() => !!localStorage.getItem("token"), []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setError(null);
            setResults([]);

            const q = String(searchQuery || "").trim();
            if (!q) return;

            try {
                setLoading(true);

                let url = `${API_URL}/api/templates/search`;
                if (searchType === "tag") {
                    url += `?tag=${encodeURIComponent(q)}`;
                } else {
                    url += `?query=${encodeURIComponent(q)}`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Search failed");

                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError(err?.message || "Failed to fetch search results.");
            } finally {
                setLoading(false);
            }
        };

        if (API_URL) fetchSearchResults();
    }, [API_URL, searchQuery, searchType]);

    const handleLike = async (templateId) => {
        if (!isAuthenticated) {
            setError("You must be logged in to like a template");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/likes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ template_id: templateId }),
            });

            if (!response.ok) throw new Error("Failed to like template");

            setResults((prev) =>
                prev.map((t) =>
                    t.id === templateId ? { ...t, likeCount: (t.likeCount || 0) + 1 } : t
                )
            );
        } catch (err) {
            setError(err?.message || "Failed to like template");
        }
    };

    const title = searchType === "tag" ? "Tag results" : "Search results";
    const subtitle =
        searchType === "tag"
            ? `Showing templates with tag ID ${searchQuery}`
            : `Results for "${searchQuery}"`;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              {searchType === "tag" ? <Tag className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
                            {searchQuery || "—"}
            </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
                </div>

                <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                        ))}
                    </div>
                </Card>
            )}

            {/* Empty */}
            {!loading && !error && results.length === 0 && (
                <Card className="p-10">
                    <div className="mx-auto max-w-lg text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                            <Search className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
                        </div>

                        <h2 className="text-lg font-semibold">No results found</h2>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Try a different keyword, or browse public templates.
                        </p>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <Button onClick={() => navigate("/public-templates")}>Browse Public Templates</Button>
                            <Button variant="outline" onClick={() => navigate("/")}>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Results grid */}
            {!loading && results.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((template) => (
                        <div key={template.id}>
                            <TemplateCard
                                template={template}
                                showAuthor
                                isAuthenticated={isAuthenticated}
                                onLike={() => handleLike(template.id)}
                                viewHref={`/templates/${template.id}`}
                                fillHref={`/submit-form/${template.id}`}
                            />
                            <TemplateTagsRow tags={template.Tags || []} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResults;