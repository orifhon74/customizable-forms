// src/components/ui/textarea.jsx
import React from "react";
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                "min-h-[96px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700",
                className
            )}
            {...props}
        />
    );
}