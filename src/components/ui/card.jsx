// src/components/ui/card.jsx
import React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
    return (
        <div
            className={cn(
                "rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }) {
    return <div className={cn("p-4 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
    return <h3 className={cn("text-base font-semibold leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
    return <p className={cn("text-sm text-zinc-600 dark:text-zinc-400", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
    return <div className={cn("p-4 pt-2", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
    return (
        <div className={cn("flex items-center justify-between gap-2 p-4 pt-2", className)} {...props} />
    );
}