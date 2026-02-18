// src/components/FormDetails.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import { Card } from "./ui/card";
import { Button } from "./ui/button";

import {
    ArrowLeft,
    ClipboardList,
    User,
    Calendar,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
} from "lucide-react";

function normalizeAnswer(questionType, answerValue) {
    if (questionType === "checkbox") {
        if (answerValue === true || answerValue === "true") return "Yes";
        if (answerValue === false || answerValue === "false") return "No";
        return "No";
    }
    if (answerValue === null || answerValue === undefined || answerValue === "") return "—";
    return String(answerValue);
}

function FormDetails() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);
    const isAdmin = user?.role === "admin";

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found. Please log in.");

                const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch form (HTTP ${response.status})`);
                }

                const data = await response.json();
                setForm(data);
            } catch (err) {
                setError(err.message || "Failed to fetch form");
            } finally {
                setLoading(false);
            }
        };

        fetchFormDetails();
    }, [formId, API_URL]);

    const canManage = useMemo(() => {
        const ownerId = form?.Template?.user_id;
        return Boolean(isAdmin || (user?.id && ownerId && user.id === ownerId));
    }, [form, isAdmin, user]);

    const handleEditForm = () => {
        navigate(`/edit-form/${formId}`);
    };

    const handleDeleteForm = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found. Please log in.");
            return;
        }

        const ok = window.confirm("Delete this form submission? This cannot be undone.");
        if (!ok) return;

        try {
            setDeleting(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete form");
            navigate("/forms");
        } catch (err) {
            setError(err.message || "Failed to delete the form.");
        } finally {
            setDeleting(false);
        }
    };

    // Error state
    if (error && !loading) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-8">
                <div className="mb-4">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to="/forms">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Couldn’t load form
                    </div>
                    <div className="mt-1 opacity-90">{error}</div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading || !form) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-8">
                <Card className="p-6">
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading form details...
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
                            />
                        ))}
                    </div>

                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900"
                            />
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    const submittedAt = form.createdAt ? new Date(form.createdAt) : null;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                        <ClipboardList className="h-5 w-5" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Form Details</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Submission #{form.id}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to="/forms">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>

                    {canManage && (
                        <>
                            <Button variant="outline" size="sm" onClick={handleEditForm} className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteForm}
                                className="gap-2"
                                disabled={deleting}
                            >
                                <Trash2 className="h-4 w-4" />
                                {deleting ? "Deleting..." : "Delete"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Meta cards */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        <ClipboardList className="h-4 w-4" />
                        Template
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {form.Template?.title || "N/A"}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        <User className="h-4 w-4" />
                        Submitted By
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {form.User?.username || "N/A"}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        <Calendar className="h-4 w-4" />
                        Date
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {submittedAt ? submittedAt.toLocaleDateString() : "—"}
                    </div>
                </Card>
            </div>

            {/* Answers */}
            <Card className="overflow-hidden">
                <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Answers</h2>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {form.FormAnswers?.length ? `Total: ${form.FormAnswers.length}` : "No answers available."}
                    </p>
                </div>

                {form.FormAnswers && form.FormAnswers.length > 0 ? (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {form.FormAnswers.map((fa) => {
                            const qText = fa.Question?.question_text || "Unknown Question";
                            const qType = fa.Question?.question_type || "unknown";
                            const value = normalizeAnswer(qType, fa.answer_value);

                            return (
                                <div key={fa.id} className="px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {qText}
                                            </div>
                                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                Type: <span className="font-mono">{qType}</span>
                                            </div>
                                        </div>

                                        <div className="sm:max-w-[50%]">
                                            <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                                                {value}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-4 py-10 text-center">
                        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            No answers found
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            This form submission does not include any answers.
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default FormDetails;