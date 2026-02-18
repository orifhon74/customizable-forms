// src/components/TemplateTagsRow.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function TemplateTagsRow({ tags = [] }) {
    const navigate = useNavigate();
    if (!tags?.length) return null;

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
                <button
                    key={tag.id}
                    onClick={() => navigate(`/search-results?q=${tag.id}&type=tag`)}
                    className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    title={`View templates for tag: ${tag.name}`}
                    type="button"
                >
                    {tag.name}
                </button>
            ))}
        </div>
    );
}