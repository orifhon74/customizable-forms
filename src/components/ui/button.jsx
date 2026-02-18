// src/components/ui/button.jsx
import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-700",
    {
        variants: {
            variant: {
                default: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
                outline: "border border-zinc-200 bg-transparent hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900",
                ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900",
                destructive: "bg-red-600 text-white hover:bg-red-700",
            },
            size: {
                sm: "h-9 px-3",
                md: "h-10 px-4",
                lg: "h-11 px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export function Button({ className, variant, size, ...props }) {
    return (
        <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
}