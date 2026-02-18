// src/components/Home.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateCard from "./TemplateCard";
import { Button } from "./ui/button";
import { Search, ArrowRight } from "lucide-react";

function Home() {
    const [latestTemplates, setLatestTemplates] = useState([]);
    const [topTemplates, setTopTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const isAuthenticated = useMemo(() => !!localStorage.getItem("token"), []);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setError(null);

                let resp = await fetch(`${API_URL}/api/templates/latest`);
                if (!resp.ok) throw new Error("Failed to fetch latest templates");
                let data = await resp.json();
                setLatestTemplates(Array.isArray(data) ? data : []);

                resp = await fetch(`${API_URL}/api/templates/top`);
                if (!resp.ok) throw new Error("Failed to fetch top templates");
                data = await resp.json();
                setTopTemplates(Array.isArray(data) ? data : []);

                resp = await fetch(`${API_URL}/api/tags/cloud`);
                if (!resp.ok) throw new Error("Failed to fetch tag cloud");
                data = await resp.json();
                setTags(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err?.message || "Something went wrong");
            }
        };

        if (API_URL) fetchHomeData();
    }, [API_URL]);

    const handleTagClick = (tagId) => {
        navigate(`/search-results?q=${tagId}&type=tag`);
    };

    const handleLike = async (templateId, isFromLatest) => {
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

            const bumpLike = (arr) =>
                arr.map((t) =>
                    t.id === templateId ? { ...t, likeCount: (t.likeCount || 0) + 1 } : t
                );

            if (isFromLatest) setLatestTemplates((prev) => bumpLike(prev));
            else setTopTemplates((prev) => bumpLike(prev));
        } catch (err) {
            setError(err?.message || "Failed to like template");
        }
    };

    return (
        <div className="space-y-10">
            {/* Hero */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Browse templates, explore tags, and build your own forms.
                        </p>

                        {/* Search hint row (replaces big search input) */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                                <Search className="h-4 w-4 text-zinc-500" />
                                Use the search bar up top to find templates fast.
                            </div>

                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => navigate("/public-templates")}
                            >
                                Browse public templates <ArrowRight className="h-4 w-4" />
                            </Button>

                            {isAuthenticated && (
                                <Button className="gap-2" onClick={() => navigate("/templates")}>
                                    Your templates <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right side: compact highlight panel so it doesn't look empty */}
                    <div className="w-full md:w-[420px]">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium">Quick tips</p>
                                    <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                                        Try keywords like “survey”, “feedback”, “quiz”, or click a tag below.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-zinc-800">
                  survey
                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-zinc-800">
                  feedback
                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-zinc-800">
                  education
                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-zinc-800">
                  job
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        {error}
                    </div>
                )}
            </section>

            {/* Latest Templates */}
            <section className="space-y-4">
                <div className="flex items-end justify-between">
                    <h2 className="text-lg font-semibold">Latest templates</h2>
                </div>

                {latestTemplates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        No latest templates available.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {latestTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                showAuthor
                                isAuthenticated={isAuthenticated}
                                onLike={() => handleLike(template.id, true)}
                                viewHref={`/templates/${template.id}`}
                                fillHref={`/submit-form/${template.id}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Top Templates */}
            <section className="space-y-4">
                <div className="flex items-end justify-between">
                    <h2 className="text-lg font-semibold">Top templates</h2>
                </div>

                {topTemplates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        No top templates available.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {topTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                showFormsFilled
                                isAuthenticated={isAuthenticated}
                                onLike={() => handleLike(template.id, false)}
                                viewHref={`/templates/${template.id}`}
                                fillHref={`/submit-form/${template.id}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Tag Cloud */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Tags</h2>

                {tags.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        No tags yet.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => handleTagClick(tag.id)}
                                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                title={`View templates for tag: ${tag.name}`}
                            >
                                {tag.name}
                                <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  {tag.count ?? 0}
                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;