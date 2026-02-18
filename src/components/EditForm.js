// src/components/EditForm.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import { Card } from "./ui/card";
import { Button } from "./ui/button";

import { ArrowLeft, Loader2, Save, AlertTriangle, Lock } from "lucide-react";

function EditForm() {
    const { formId } = useParams();
    const navigate = useNavigate();

    const [formRecord, setFormRecord] = useState(null); // Form object
    const [template, setTemplate] = useState(null); // Template object (with Questions)
    const [answers, setAnswers] = useState({}); // question_id => answer_value

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const fetchFormAndTemplate = async () => {
            setError(null);
            setSuccess(null);
            setLoading(true);

            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token. Please log in.");

                // 1) Fetch the form with FormAnswers
                const formRes = await fetch(`${API_URL}/api/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!formRes.ok) {
                    let msg = "Failed to fetch form for editing";
                    try {
                        const data = await formRes.json();
                        msg = data?.error || data?.message || msg;
                    } catch {}
                    throw new Error(msg);
                }

                const formData = await formRes.json();
                setFormRecord(formData);

                // 2) Fetch template (Questions + allow_editing)
                const templateRes = await fetch(`${API_URL}/api/templates/${formData.template_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!templateRes.ok) {
                    let msg = "Failed to fetch template for form";
                    try {
                        const data = await templateRes.json();
                        msg = data?.error || data?.message || msg;
                    } catch {}
                    throw new Error(msg);
                }

                const templateData = await templateRes.json();
                setTemplate(templateData);

                // 3) Initialize answers from existing FormAnswers
                const initialAnswers = {};
                if (Array.isArray(formData.FormAnswers)) {
                    formData.FormAnswers.forEach((fa) => {
                        initialAnswers[fa.question_id] = fa.answer_value;
                    });
                }

                // 4) Ensure every template question has a key in answers
                if (Array.isArray(templateData.Questions)) {
                    templateData.Questions.forEach((q) => {
                        if (initialAnswers[q.id] === undefined) {
                            initialAnswers[q.id] = q.question_type === "checkbox" ? "false" : "";
                        }
                    });
                }

                setAnswers(initialAnswers);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        if (API_URL) fetchFormAndTemplate();
    }, [formId, API_URL]);

    const sortedQuestions = useMemo(() => {
        const qs = template?.Questions || [];
        return [...qs].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }, [template]);

    const allowEditing = template?.allow_editing === true;
    const isSubmitter = Boolean(user?.id && formRecord?.user_id && user.id === formRecord.user_id);

    // Final rule:
    // - Admin can edit always
    // - Submitter can edit only if allow_editing === true
    const canEdit = Boolean(isAdmin || (isSubmitter && allowEditing));

    const handleAnswerChange = (questionId, questionType, value) => {
        setAnswers((prev) => {
            if (questionType === "checkbox") {
                return { ...prev, [questionId]: value ? "true" : "false" };
            }
            return { ...prev, [questionId]: value };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!canEdit) {
            setError("Editing is not allowed for this submission.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found. Please log in.");
            return;
        }

        try {
            setSaving(true);

            const updatedFormAnswers = Object.entries(answers).map(([qId, val]) => ({
                question_id: Number(qId),
                answer_value: String(val ?? ""),
            }));

            const requestBody = { FormAnswers: updatedFormAnswers };

            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                let msg = "Failed to update form";
                try {
                    const data = await response.json();
                    msg = data?.error || data?.message || msg;
                } catch {}
                throw new Error(msg);
            }

            setSuccess("Form updated successfully!");
            navigate(-1);
        } catch (err) {
            setError(err.message || "Failed to update form.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-4xl px-4 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="h-7 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-9 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <Card className="p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    if (error && !formRecord && !template) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-10">
                <Card className="p-6">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        <div className="flex items-center gap-2 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!formRecord || !template) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-10">
                <Card className="p-6">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Missing form or template data.</p>
                    <div className="mt-4">
                        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Hard stop UI if user isn't allowed to edit
    if (!canEdit) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-10">
                <Card className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">Editing disabled</h1>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                This template does not allow editing submitted forms.
                            </p>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                Template: <span className="font-medium">{template?.title || "—"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={() => navigate("/forms")}>My submissions</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-10">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Form</h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Update answers for{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {template?.title || "this template"}
            </span>
                        .
                    </p>
                </div>

                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Alerts */}
            {success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    {error}
                </div>
            )}

            {/* Form */}
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {sortedQuestions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {sortedQuestions.map((q) => {
                                const currentVal =
                                    answers[q.id] ?? (q.question_type === "checkbox" ? "false" : "");
                                const label = q.question_text || "Untitled question";

                                return (
                                    <div key={q.id} className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                            {label}
                                        </label>

                                        {q.question_type === "string" && (
                                            <input
                                                type="text"
                                                value={String(currentVal)}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value)
                                                }
                                                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                            />
                                        )}

                                        {q.question_type === "multiline" && (
                                            <textarea
                                                rows={4}
                                                value={String(currentVal)}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value)
                                                }
                                                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                            />
                                        )}

                                        {q.question_type === "integer" && (
                                            <input
                                                type="number"
                                                value={String(currentVal)}
                                                onChange={(e) =>
                                                    handleAnswerChange(q.id, q.question_type, e.target.value)
                                                }
                                                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                            />
                                        )}

                                        {q.question_type === "checkbox" && (
                                            <label className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                                                <input
                                                    type="checkbox"
                                                    checked={String(currentVal) === "true"}
                                                    onChange={(e) =>
                                                        handleAnswerChange(q.id, q.question_type, e.target.checked)
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                <span className="text-zinc-700 dark:text-zinc-300">
                          Check if true
                        </span>
                                            </label>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                            No questions found for this template.
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>

                        <Button type="submit" disabled={saving} className="gap-2">
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default EditForm;