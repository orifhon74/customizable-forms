// src/components/AdminDashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

import {
    Users,
    LayoutTemplate,
    FileText,
    PlusCircle,
    Shield,
    ArrowRight,
} from "lucide-react";

function AdminDashboard() {
    const navigate = useNavigate();

    const tiles = [
        {
            title: "User Management",
            description: "Manage users, roles, and access.",
            to: "/admin/users",
            icon: Users,
        },
        {
            title: "Templates",
            description: "View, edit, and moderate templates.",
            to: "/templates",
            icon: LayoutTemplate,
        },
        {
            title: "Forms",
            description: "Access and manage submitted forms.",
            to: "/forms",
            icon: FileText,
        },
        {
            title: "Create Template",
            description: "Publish a new template for users.",
            to: "/create-template",
            icon: PlusCircle,
        },
    ];

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                    <Shield className="h-3.5 w-3.5" />
                    Admin Area
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Quick actions for managing the platform.
                </p>
            </div>

            {/* Tiles */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tiles.map((t) => {
                    const Icon = t.icon;

                    return (
                        <Card
                            key={t.title}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(t.to)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    navigate(t.to);
                                }
                            }}
                            className="group cursor-pointer transition-all hover:border-zinc-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 transition group-hover:opacity-100" />
                                </div>

                                <CardTitle className="mt-3 text-base">
                                    {t.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {t.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                Tip: Keep an eye on templates with lots of traffic (likes/forms) to spot what users want more of.
            </div>
        </div>
    );
}

export default AdminDashboard;