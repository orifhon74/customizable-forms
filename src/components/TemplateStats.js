import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { AlertTriangle } from "lucide-react";

function TemplateStats({ templateId }) {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Unauthorized: No token found");

                const res = await fetch(`${API_URL}/api/aggregator/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error(`Error fetching stats: ${res.statusText}`);
                }

                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
            }
        };

        fetchStats();
    }, [templateId, API_URL]);

    const formatKey = (key) =>
        key
            .replace("_answer", "")
            .replace("custom_", "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Loading statistics...
            </div>
        );
    }

    const averages = stats.averages || {};
    const commonStrings = stats.commonStrings || {};
    const checkboxStats = stats.checkboxStats || {};

    return (
        <div className="space-y-6">
            {/* Total submissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold">
                        {stats.total_forms ?? 0}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Total Forms Submitted
                    </p>
                </CardContent>
            </Card>

            {/* Numeric averages */}
            {Object.keys(averages).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Average Values (Numeric Fields)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(averages).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between border-b border-zinc-200 pb-2 text-sm dark:border-zinc-800"
                            >
                                <span className="font-medium">{formatKey(key)}</span>
                                <span>
                  {value !== null && value !== undefined
                      ? Number(value).toFixed(2)
                      : "N/A"}
                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Most common strings */}
            {Object.keys(commonStrings).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Most Common Answers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(commonStrings).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between border-b border-zinc-200 pb-2 text-sm dark:border-zinc-800"
                            >
                                <span className="font-medium">{formatKey(key)}</span>
                                <span>{value || "N/A"}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Checkbox stats */}
            {Object.keys(checkboxStats).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Checkbox Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(checkboxStats).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between border-b border-zinc-200 pb-2 text-sm dark:border-zinc-800"
                            >
                                <span className="font-medium">{formatKey(key)}</span>
                                <span>
                  True: {value?.true ?? 0} | False: {value?.false ?? 0}
                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default TemplateStats;