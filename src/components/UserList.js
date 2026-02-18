// src/components/UserList.js
import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API_URL}/api/users`);
                if (!res.ok) throw new Error("Failed to fetch users");
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Error fetching users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [API_URL]);

    return (
        <div className="mx-auto max-w-3xl py-6 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Users</CardTitle>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-md" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                            No users found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {user.username?.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="text-sm font-medium">
                                                {user.username}
                                            </p>
                                            {user.email && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {user.role && (
                                        <Badge
                                            variant={
                                                user.role === "admin"
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                        >
                                            {user.role}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default UserList;