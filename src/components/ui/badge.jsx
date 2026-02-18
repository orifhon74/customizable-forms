// src/components/ui/badge.jsx
import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
                secondary: "border-transparent bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
                outline: "border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-50",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export function Badge({ className, variant, ...props }) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}