// src/components/ui/separator.jsx
import React from "react";
import { cn } from "../../lib/utils";

export function Separator({ className, ...props }) {
    return <div className={cn("h-px w-full bg-zinc-200 dark:bg-zinc-800", className)} {...props} />;
}