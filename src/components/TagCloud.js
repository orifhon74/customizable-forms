// src/components/TagCloud.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { Hash, Search } from "lucide-react";

function TagCloud() {
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState("");
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchTagCloud = async () => {
            setLoading(true);
            setError(null);

            try {
                const resp = await fetch(`${API_URL}/api/tags/cloud`);
                if (!resp.ok) throw new Error("Failed to fetch tag cloud");
                const data = await resp.json();
                setTags(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Failed to fetch tag cloud");
            } finally {
                setLoading(false);
            }
        };

        fetchTagCloud();
    }, [API_URL]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return tags;
        return tags.filter((t) => (t.name || "").toLowerCase().includes(needle));
    }, [tags, q]);

    const handleTagClick = (tag) => {
        // IMPORTANT: Your search page expects tag queries as IDs (q=4&type=tag)
        navigate(`/search-results?q=${encodeURIComponent(tag.id)}&type=tag`);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Hash className="h-4 w-4" />
                    Tag Cloud
                </CardTitle>
            </CardHeader>

            <CardContent>
                {/* Search tags */}
                <div className="relative mb-4">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Filter tags..."
                        className="pl-9"
                    />
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-8 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-900"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                        No tags found.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {filtered.map((tag) => (
                            <Button
                                key={tag.id}
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleTagClick(tag)}
                                className="rounded-full"
                                title={`Search templates tagged: ${tag.name}`}
                            >
                                {tag.name}
                            </Button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default TagCloud;