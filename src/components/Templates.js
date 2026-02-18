// src/components/Templates.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

import {
    ArrowLeft,
    Eye,
    Pencil,
    Trash2,
    BarChart3,
    Shield,
    Lock,
    Globe,
} from "lucide-react";

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forms, setForms] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(true);

    const navigate = useNavigate();
    const { id } = useParams();

    const API_URL = process.env.REACT_APP_API_URL;

    const user = useMemo(() => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    }, []);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const isAdmin = user?.role === "admin";
    const userId = user?.id;
    const userRole = user?.role;

    useEffect(() => {
        const fetchTemplates = async () => {
            if (!token) {
                setError("Unauthorized: No token found");
                setLoadingList(false);
                return;
            }

            try {
                setError(null);
                setLoadingList(true);

                const resTemplates = await fetch(`${API_URL}/api/templates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!resTemplates.ok) throw new Error("Failed to fetch templates");

                const dataTemplates = await resTemplates.json();

                // Admin sees all; user sees only their own (your backend returns public+owned, but you want owned here)
                const visible = userRole === "admin"
                    ? dataTemplates
                    : dataTemplates.filter((tpl) => tpl.user_id === userId);

                setTemplates(visible);
            } catch (err) {
                setError(err.message || "Failed to fetch templates");
            } finally {
                setLoadingList(false);
            }
        };

        fetchTemplates();
    }, [API_URL, token, userRole, userId]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;

            if (!token) {
                setError("Unauthorized: No token found");
                setLoadingDetails(false);
                return;
            }

            try {
                setError(null);
                setLoadingDetails(true);

                // We already fetched templates list above, but to keep logic stable:
                // fetch the templates again and find it. (Could optimize later)
                const resTemplates = await fetch(`${API_URL}/api/templates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resTemplates.ok) throw new Error("Failed to fetch templates");
                const allTemplates = await resTemplates.json();

                const foundTemplate = allTemplates.find((tpl) => tpl.id === parseInt(id, 10));
                if (!foundTemplate) {
                    setError("Template not found");
                    setSelectedTemplate(null);
                    return;
                }

                setSelectedTemplate(foundTemplate);

                // Forms
                const resForms = await fetch(
                    `${API_URL}/api/forms/template/${foundTemplate.id}?includeAnswers=true`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!resForms.ok) throw new Error("Failed to fetch forms");
                const dataForms = await resForms.json();
                setForms(dataForms);

                // Stats
                const resStats = await fetch(`${API_URL}/api/aggregator/unlimited/${foundTemplate.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resStats.ok) throw new Error("Failed to fetch aggregator stats");
                const dataStats = await resStats.json();
                setStats(dataStats);
            } catch (err) {
                setError(err.message || "Failed to fetch template details");
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [API_URL, id, token]);

    // ----------------
    // Template actions
    // ----------------
    const handleDeleteTemplate = async (templateId) => {
        if (!token) return;

        const ok = window.confirm("Delete this template? This cannot be undone.");
        if (!ok) return;

        try {
            const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete template");

            setTemplates((prev) => prev.filter((t) => t.id !== templateId));

            if (templateId === parseInt(id || "", 10)) {
                navigate("/templates");
            }
        } catch (err) {
            setError(err.message || "Failed to delete template");
        }
    };

    const handleEditTemplate = (templateId) => {
        navigate(`/create-template?edit=true&templateId=${templateId}`);
    };

    // -------------
    // Form actions
    // -------------
    const handleDeleteForm = async (formId) => {
        if (!token) return;

        const ok = window.confirm("Delete this form submission?");
        if (!ok) return;

        try {
            const response = await fetch(`${API_URL}/api/forms/${formId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete form");
            setForms((prev) => prev.filter((f) => f.id !== formId));
        } catch (err) {
            setError(err.message || "Failed to delete form");
        }
    };

    const handleEditForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    const AccessPill = ({ access_type }) => {
        const isPublic = access_type === "public";
        return (
            <span
                className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    isPublic
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200",
                ].join(" ")}
            >
        {isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isPublic ? "Public" : "Private"}
      </span>
        );
    };

    // ---------------------------
    // LIST VIEW: /templates
    // ---------------------------
    if (!id) {
        return (
            <div className="space-y-6">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Create, edit, and manage your templates. View submissions from each template.
                        </p>
                    </div>

                    <Button onClick={() => navigate("/create-template")}>Create template</Button>
                </header>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        {error}
                    </div>
                )}

                {loadingList ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <Card key={idx} className="overflow-hidden p-4">
                                <Skeleton className="h-36 w-full" />
                                <div className="mt-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <Skeleton className="h-9 w-9" />
                                    <Skeleton className="h-9 w-9" />
                                    <Skeleton className="h-9 w-9" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        You have no templates yet. Create one and start collecting submissions.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <Card key={template.id} className="overflow-hidden">
                                {/* Image */}
                                {template.image_url ? (
                                    <div className="h-36 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                        <img
                                            src={template.image_url}
                                            alt={template.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-36 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                                        No image
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-semibold">{template.title}</h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                {template.description || "No description"}
                                            </p>
                                        </div>
                                        <AccessPill access_type={template.access_type} />
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => navigate(`/template/${template.id}`)}
                                            title="View submissions & stats"
                                            aria-label="View"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEditTemplate(template.id)}
                                            title="Edit template"
                                            aria-label="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            title="Delete template"
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ---------------------------
    // DETAILS VIEW: /template/:id
    // ---------------------------
    if (loadingDetails && !selectedTemplate) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <Card className="p-6">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                </Card>
            </div>
        );
    }

    if (!selectedTemplate) {
        return (
            <div className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        {error}
                    </div>
                )}
                <Button variant="outline" onClick={() => navigate("/templates")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        );
    }

    const canManage = isAdmin || userId === selectedTemplate.user_id;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{selectedTemplate.title}</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {selectedTemplate.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2">
                        <AccessPill access_type={selectedTemplate.access_type} />
                        {isAdmin && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate("/templates")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    {canManage && (
                        <>
                            <Button variant="outline" onClick={() => handleEditTemplate(selectedTemplate.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button variant="destructive" onClick={() => handleDeleteTemplate(selectedTemplate.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    {error}
                </div>
            )}

            {/* Stats */}
            <Card className="p-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                    <h2 className="text-lg font-semibold">Statistics</h2>
                </div>

                {!stats ? (
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                        No statistics yet.
                    </p>
                ) : (
                    <div className="mt-4 space-y-5">
                        <div className="text-sm">
                            <span className="font-medium">Total forms submitted:</span>{" "}
                            {stats.totalForms}
                        </div>

                        {stats.numericAverages?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold">Average values (numeric)</h3>
                                <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    {stats.numericAverages.map((item) => (
                                        <li key={item.question_id}>
                                            <span className="font-medium">{item.question_text}:</span>{" "}
                                            {item.average !== null ? item.average.toFixed(2) : "N/A"}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {stats.commonStrings?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold">Most common answers (text)</h3>
                                <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    {stats.commonStrings.map((item) => (
                                        <li key={item.question_id}>
                                            <span className="font-medium">{item.question_text}:</span>{" "}
                                            {item.mostCommon || "N/A"}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {stats.checkboxStats?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold">Checkbox stats</h3>
                                <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    {stats.checkboxStats.map((item) => (
                                        <li key={item.question_id}>
                                            <span className="font-medium">{item.question_text}:</span>{" "}
                                            True: {item.trueCount}, False: {item.falseCount}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Submitted forms */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold">Submitted forms</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    View submissions and answers. You can edit or delete submissions if you own the template (or admin).
                </p>

                <Separator className="my-4" />

                {forms.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        No forms have been submitted yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                        <span className="font-medium">Form ID:</span> {form.id}{" "}
                                        <span className="mx-2 text-zinc-400">|</span>
                                        <span className="font-medium">Submitted by:</span>{" "}
                                        {form.User?.username ?? "Unknown"}
                                    </div>

                                    {canManage && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditForm(form.id)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteForm(form.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Answers */}
                                {form.FormAnswers?.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold">Answers</h3>
                                        <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                            {form.FormAnswers.map((fa) => {
                                                let displayVal = fa.answer_value;
                                                if (fa.Question?.question_type === "checkbox") {
                                                    displayVal = fa.answer_value === "true" ? "Yes" : "No";
                                                }
                                                return (
                                                    <li key={fa.id}>
                            <span className="font-medium">
                              {fa.Question?.question_text}:
                            </span>{" "}
                                                        {displayVal}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default Templates;