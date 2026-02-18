// src/components/FormSubmission.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import {
    ClipboardList,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";

function FormSubmission() {
    const { templateId } = useParams();

    const [template, setTemplate] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // string
    const [submittedFormId, setSubmittedFormId] = useState(null); // NEW

    const [loadingTemplate, setLoadingTemplate] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setLoadingTemplate(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) throw new Error("You must be logged in to view this form.");

                const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    let msg = "Failed to fetch template";
                    try {
                        const data = await response.json();
                        msg = data?.error || data?.message || msg;
                    } catch {}
                    throw new Error(msg);
                }

                const data = await response.json();
                setTemplate(data);

                // Initialize answers
                const initialAnswers = {};
                if (Array.isArray(data.Questions)) {
                    data.Questions.forEach((q) => {
                        initialAnswers[q.id] = q.question_type === "checkbox" ? "false" : "";
                    });
                }
                setAnswers(initialAnswers);
            } catch (err) {
                setError(err.message || "Failed to load template");
            } finally {
                setLoadingTemplate(false);
            }
        };

        if (API_URL) fetchTemplate();
    }, [templateId, API_URL]);

    const questions = useMemo(() => template?.Questions || [], [template]);

    const handleChange = (questionId, questionType, value, checked) => {
        setAnswers((prev) => {
            if (questionType === "checkbox") {
                return { ...prev, [questionId]: checked ? "true" : "false" };
            }
            return { ...prev, [questionId]: value };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmittedFormId(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in to submit a form");
            return;
        }

        try {
            setSubmitting(true);

            const answersArray = Object.entries(answers).map(([qId, val]) => ({
                question_id: parseInt(qId, 10),
                answer_value: String(val ?? ""),
            }));

            const response = await fetch(`${API_URL}/api/forms/${templateId}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answers: answersArray }),
            });

            if (!response.ok) {
                let msg = "Failed to submit form";
                try {
                    const data = await response.json();
                    msg = data?.error || data?.message || msg;
                } catch {}
                throw new Error(msg);
            }

            const data = await response.json();
            setSuccess("Form submitted successfully!");
            setSubmittedFormId(data?.form_id ?? null);

            // Reset answers for a clean feel
            const reset = {};
            questions.forEach((q) => {
                reset[q.id] = q.question_type === "checkbox" ? "false" : "";
            });
            setAnswers(reset);
        } catch (err) {
            setError(err.message || "Failed to submit form");
        } finally {
            setSubmitting(false);
        }
    };

    // Error state
    if (error && !loadingTemplate) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <div className="mb-4">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to="/public-templates">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Something went wrong
                    </div>
                    <div className="mt-1 opacity-90">{error}</div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loadingTemplate || !template) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <Card className="p-6">
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading template...
                    </div>

                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-12 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900"
                            />
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Fill Out Form</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{template.title}</p>
                    </div>
                </div>

                <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to={`/templates/${templateId}`}>
                        <ArrowLeft className="h-4 w-4" />
                        Details
                    </Link>
                </Button>
            </div>

            {/* Success */}
            {success && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        {success}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                            <Link to="/forms">My Submissions</Link>
                        </Button>

                        {submittedFormId && (
                            <Button asChild size="sm" variant="outline">
                                <Link to={`/forms/${submittedFormId}`}>View This Submission</Link>
                            </Button>
                        )}

                        <Button asChild size="sm">
                            <Link to="/public-templates">Browse Templates</Link>
                        </Button>
                    </div>
                </div>
            )}

            {/* Error inline (submit errors) */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                    </div>
                </div>
            )}

            {/* Form */}
            <Card className="p-6">
                {questions.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                        This template has no questions defined.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {questions.map((q, idx) => {
                            const value =
                                answers[q.id] ?? (q.question_type === "checkbox" ? "false" : "");

                            return (
                                <div key={q.id} className="space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {idx + 1}. {q.question_text}
                                        </label>
                                        <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                      {q.question_type}
                    </span>
                                    </div>

                                    {q.question_type === "string" && (
                                        <Input
                                            value={value}
                                            onChange={(e) => handleChange(q.id, q.question_type, e.target.value)}
                                            placeholder="Type your answer..."
                                        />
                                    )}

                                    {q.question_type === "multiline" && (
                                        <Textarea
                                            value={value}
                                            onChange={(e) => handleChange(q.id, q.question_type, e.target.value)}
                                            placeholder="Type your answer..."
                                            className="min-h-[96px]"
                                        />
                                    )}

                                    {q.question_type === "integer" && (
                                        <Input
                                            type="number"
                                            value={value}
                                            onChange={(e) => handleChange(q.id, q.question_type, e.target.value)}
                                            placeholder="0"
                                        />
                                    )}

                                    {q.question_type === "checkbox" && (
                                        <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={value === "true"}
                                                onChange={(e) =>
                                                    handleChange(q.id, q.question_type, null, e.target.checked)
                                                }
                                            />
                                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                                Check if true
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="pt-2">
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Form"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}

export default FormSubmission;