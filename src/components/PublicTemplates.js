// src/components/PublicTemplates.js
import React, { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import TemplateTagsRow from "./TemplateTagsRow";

function PublicTemplates() {
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;
    const isAuthenticated = useMemo(() => !!localStorage.getItem("token"), []);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setError(null);
                const response = await fetch(`${API_URL}/api/templates/public`);
                if (!response.ok) throw new Error("Failed to fetch public templates");
                const data = await response.json();
                setTemplates(data);
            } catch (err) {
                setError(err.message || "Failed to fetch public templates");
            }
        };

        if (API_URL) fetchTemplates();
    }, [API_URL]);

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

            setTemplates((prev) =>
                prev.map((t) =>
                    t.id === templateId ? { ...t, likeCount: (t.likeCount || 0) + 1 } : t
                )
            );
        } catch (err) {
            setError(err.message || "Failed to like template");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Public Templates</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Browse templates created by the community. View details anytime, and fill out forms when logged in.
                </p>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        {error}
                    </div>
                )}
            </header>

            {templates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                    No public templates available at the moment.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <div key={template.id}>
                            <TemplateCard
                                template={template}
                                showAuthor
                                isAuthenticated={isAuthenticated}
                                onLike={() => handleLike(template.id)}
                                viewHref={`/templates/${template.id}`}
                                fillHref={`/submit-form/${template.id}`}
                            />
                            {/* Tag pills (below the card) */}
                            <TemplateTagsRow tags={template.Tags || []} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PublicTemplates;