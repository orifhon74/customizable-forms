// src/components/AdminUserManagement.js
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

import {
    Shield,
    User2,
    Search,
    RefreshCw,
    UserX,
    UserCheck,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Mail,
    Hash,
} from "lucide-react";

function Badge({ children, variant = "default" }) {
    const base =
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
    const styles = {
        default:
            "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
        admin:
            "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
        user:
            "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200",
        active:
            "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
        blocked:
            "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200",
    };
    return <span className={`${base} ${styles[variant] || styles.default}`}>{children}</span>;
}

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState("");

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        const token = localStorage.getItem("token");
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) throw new Error("Failed to update role");
            await fetchUsers();
        } catch (err) {
            setError(err.message || "Failed to update role");
        }
    };

    const toggleBlockUser = async (userId) => {
        const token = localStorage.getItem("token");
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/block`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to block/unblock user");
            await fetchUsers();
        } catch (err) {
            setError(err.message || "Failed to block/unblock user");
        }
    };

    const deleteUser = async (userId) => {
        const token = localStorage.getItem("token");
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete user");
            await fetchUsers();
        } catch (err) {
            setError(err.message || "Failed to delete user");
        }
    };

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return users;

        return users.filter((u) => {
            const hay = `${u.id} ${u.username} ${u.email} ${u.role}`.toLowerCase();
            return hay.includes(needle);
        });
    }, [users, q]);

    const stats = useMemo(() => {
        const total = users.length;
        const admins = users.filter((u) => u.role === "admin").length;
        const blocked = users.filter((u) => u.deletedAt).length;
        return { total, admins, blocked };
    }, [users]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                        <Shield className="h-3.5 w-3.5" />
                        Admin
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Promote, block, or remove users.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Top stats + search */}
            <div className="mb-4 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Total users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Admins
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats.admins}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Blocked
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats.blocked}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by username, email, role, or id..."
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30">
                    <CardContent className="py-4 text-sm text-red-700 dark:text-red-200">
                        {error}
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                        Users <span className="text-sm font-normal text-zinc-500">({filtered.length})</span>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900"
                                />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-md border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                            No users match your search.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
                            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                                <thead className="bg-zinc-50 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Hash className="h-4 w-4" /> ID
                      </span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                      <span className="inline-flex items-center gap-2">
                        <User2 className="h-4 w-4" /> Username
                      </span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </span>
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">Role</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                                {filtered.map((user) => {
                                    const isBlocked = !!user.deletedAt;
                                    const isAdmin = user.role === "admin";

                                    return (
                                        <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{user.id}</td>
                                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                                                {user.username}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{user.email}</td>

                                            <td className="px-4 py-3">
                                                <Badge variant={isAdmin ? "admin" : "user"}>
                                                    {isAdmin ? "admin" : "user"}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3">
                                                <Badge variant={isBlocked ? "blocked" : "active"}>
                                                    {isBlocked ? "Blocked" : "Active"}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateUserRole(user.id, isAdmin ? "user" : "admin")}
                                                        title={isAdmin ? "Demote to user" : "Promote to admin"}
                                                    >
                                                        {isAdmin ? (
                                                            <>
                                                                <ArrowDownRight className="mr-2 h-4 w-4" />
                                                                Demote
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                                                Promote
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant={isBlocked ? "outline" : "destructive"}
                                                        size="sm"
                                                        onClick={() => {
                                                            const ok = window.confirm(
                                                                isBlocked
                                                                    ? "Unblock this user?"
                                                                    : "Block this user? They won't be able to log in."
                                                            );
                                                            if (!ok) return;
                                                            toggleBlockUser(user.id);
                                                        }}
                                                        title={isBlocked ? "Unblock user" : "Block user"}
                                                    >
                                                        {isBlocked ? (
                                                            <>
                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                Unblock
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Block
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            const ok = window.confirm(
                                                                "Delete this user permanently? This cannot be undone."
                                                            );
                                                            if (!ok) return;
                                                            deleteUser(user.id);
                                                        }}
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminUserManagement;