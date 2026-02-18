// src/components/TemplateForm.js
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { LanguageContext } from "../context/LanguageContext";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import {
    ArrowLeft,
    Image as ImageIcon,
    Loader2,
    Plus,
    Trash2,
    Tag as TagIcon,
    Lock,
    Globe,
    HelpCircle,
    Pencil,
} from "lucide-react";

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const isEditMode = queryParams.get("edit") === "true";
    const templateId = queryParams.get("templateId");

    // Basic fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [accessType, setAccessType] = useState("public");
    const [topic, setTopic] = useState("Other");
    const [imageUrl, setImageUrl] = useState("");

    // ✅ NEW: allow submission editing toggle
    const [allowEditing, setAllowEditing] = useState(false);

    // Questions: [{ question_text, question_type }]
    const [questions, setQuestions] = useState([]);

    // Tags
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    // UI state
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [saving, setSaving] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;
    const { t } = useContext(LanguageContext);

    const pageTitle = isEditMode ? "Edit Template" : "Create Template";

    const topicOptions = useMemo(
        () => [
            "Other",
            "Quiz",
            "Feedback",
            "Education",
            "Survey",
            "Job",
            "Health",
            "Research",
            "Finance",
            "Entertainment",
        ],
        []
    );

    const questionTypeOptions = useMemo(
        () => [
            { value: "string", label: "String (single line)" },
            { value: "multiline", label: "Multiline" },
            { value: "integer", label: "Integer" },
            { value: "checkbox", label: "Checkbox" },
        ],
        []
    );

    // -----------------------------
    // Fetch template when editing
    // -----------------------------
    useEffect(() => {
        if (!(isEditMode && templateId)) return;

        const fetchTemplate = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                setLoadingTemplate(true);
                setError(null);

                const resp = await fetch(`${API_URL}/api/templates/${templateId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) throw new Error("Failed to fetch template for editing");

                const data = await resp.json();

                setTitle(data.title || "");
                setDescription(data.description || "");
                setAccessType(data.access_type || "public");
                setTopic(data.topic_id || "Other");
                setImageUrl(data.image_url || "");

                // ✅ NEW: hydrate allow_editing
                setAllowEditing(Boolean(data.allow_editing));

                const normalizedTags = Array.isArray(data.tags)
                    ? data.tags
                    : Array.isArray(data.Tags)
                        ? data.Tags.map((x) => x.name)
                        : [];

                setTags(normalizedTags);

                if (Array.isArray(data.Questions)) {
                    setQuestions(
                        data.Questions.map((q) => ({
                            question_text: q.question_text,
                            question_type: q.question_type,
                        }))
                    );
                } else {
                    setQuestions([]);
                }
            } catch (err) {
                setError(err.message || "Failed to load template");
            } finally {
                setLoadingTemplate(false);
            }
        };

        fetchTemplate();
    }, [isEditMode, templateId, API_URL]);

    // -----------------------------
    // Tag handlers
    // -----------------------------
    const addTag = (raw) => {
        const next = (raw || "").trim();
        if (!next) return;

        const norm = next;

        setTags((prev) => {
            if (prev.includes(norm)) return prev;
            return [...prev, norm];
        });
    };

    const handleAddTag = () => {
        addTag(tagInput);
        setTagInput("");
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    };

    // -----------------------------
    // Question handlers
    // -----------------------------
    const handleAddQuestion = () => {
        setQuestions((prev) => [...prev, { question_text: "", question_type: "string" }]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
    };

    // -----------------------------
    // Image Upload (Firebase)
    // -----------------------------
    const handleImageUpload = async (e) => {
        const file = e.target?.files?.[0];
        if (!file) {
            setError("No file selected");
            return;
        }

        setError(null);
        setSuccess(null);

        const storageRef = ref(storage, `template-images/${Date.now()}-${file.name}`);

        try {
            setUploading(true);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setImageUrl(url);
        } catch (err) {
            setError("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    // -----------------------------
    // Submit
    // -----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in to create or edit a template");
            return;
        }

        const url = isEditMode ? `${API_URL}/api/templates/${templateId}` : `${API_URL}/api/templates`;
        const method = isEditMode ? "PUT" : "POST";

        const requestBody = {
            title,
            description,
            access_type: accessType,
            topic_id: topic,
            image_url: imageUrl,
            tags,
            questions,
            // ✅ NEW:
            allow_editing: allowEditing,
        };

        try {
            setSaving(true);

            const resp = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!resp.ok) {
                const msg = await resp.json().catch(() => ({}));
                throw new Error(msg.error || `Failed to ${isEditMode ? "update" : "create"} template`);
            }

            setSuccess(`Template ${isEditMode ? "updated" : "created"} successfully!`);
            navigate("/templates");
        } catch (err) {
            setError(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-8">
            {/* Top bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to="/templates">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Build a template people can actually use. No weird vibes. ✅
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddQuestion}
                        className="gap-2"
                        disabled={saving || loadingTemplate}
                    >
                        <Plus className="h-4 w-4" />
                        Add Question
                    </Button>

                    <Button onClick={handleSubmit} disabled={saving || loadingTemplate || uploading}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : isEditMode ? (
                            "Save Changes"
                        ) : (
                            "Create Template"
                        )}
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {success}
                </div>
            )}

            {/* Loading skeleton */}
            {loadingTemplate ? (
                <Card className="p-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading template...
                    </div>
                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
                        ))}
                    </div>
                </Card>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT: Main fields */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <div className="space-y-5">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Title
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="E.g. Customer Feedback Form"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Description
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What is this template for?"
                                        className="min-h-[110px]"
                                    />
                                </div>

                                {/* Access + Topic */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {accessType === "public" ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                            Access Type
                                        </label>

                                        <select
                                            value={accessType}
                                            onChange={(e) => setAccessType(e.target.value)}
                                            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                        >
                                            <option value="public">Public</option>
                                            <option value="private">Private</option>
                                        </select>

                                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                            Public shows on the home page. Private is only visible to owner/admin.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            Topic
                                        </label>

                                        <select
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                        >
                                            {topicOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt === "Job" ? "Job Application" : opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ✅ NEW: Allow editing toggle */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        <Pencil className="h-4 w-4" />
                                        Allow submitters to edit submissions
                                    </label>

                                    <select
                                        value={allowEditing ? "yes" : "no"}
                                        onChange={(e) => setAllowEditing(e.target.value === "yes")}
                                        className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                    >
                                        <option value="no">No (default)</option>
                                        <option value="yes">Yes</option>
                                    </select>

                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                        If enabled, the person who submitted the form can later edit their answers.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Questions */}
                        <Card className="mt-6 p-6">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight">Questions</h2>
                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                        Add as many as you want. Keep them short and unambiguous, like a good API.
                                    </p>
                                </div>

                                <Button type="button" variant="outline" onClick={handleAddQuestion} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>

                            {questions.length === 0 ? (
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                                    No questions yet. Add one to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {questions.map((q, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    Question {i + 1}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveQuestion(i)}
                                                    className="gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                        Prompt
                                                    </label>
                                                    <Input
                                                        value={q.question_text || ""}
                                                        onChange={(e) => handleQuestionChange(i, "question_text", e.target.value)}
                                                        placeholder="E.g. What is your name?"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                        Type
                                                    </label>
                                                    <select
                                                        value={q.question_type || "string"}
                                                        onChange={(e) => handleQuestionChange(i, "question_type", e.target.value)}
                                                        className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-700"
                                                    >
                                                        {questionTypeOptions.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* RIGHT: Tags + Image + Tips */}
                    <div className="space-y-6">
                        {/* Image */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold">Cover Image</h3>
                                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                                        Optional. Upload to Firebase.
                                    </p>
                                </div>
                                <ImageIcon className="h-4 w-4 text-zinc-500" />
                            </div>

                            <div className="mt-4 space-y-3">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    disabled={uploading || saving}
                                    className="block w-full cursor-pointer text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
                                />

                                {uploading && (
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading...
                                    </div>
                                )}

                                {imageUrl ? (
                                    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                                        <img
                                            src={imageUrl}
                                            alt="Template cover"
                                            className="h-40 w-full rounded-md object-cover"
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl("")}>
                                                Remove image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                                        No image uploaded.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Tags */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold">Tags</h3>
                                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                                        Press Enter to add. Keep them short.
                                    </p>
                                </div>
                                <TagIcon className="h-4 w-4 text-zinc-500" />
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="e.g. survey"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={handleAddTag}>
                                    Add
                                </Button>
                            </div>

                            {tags.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                        >
                      {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                                                aria-label={`Remove tag ${tag}`}
                                                title="Remove"
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">No tags yet.</div>
                            )}
                        </Card>

                        {/* Tips */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                                Quick tips
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <li>• Use “multiline” for explanations, “string” for short answers.</li>
                                <li>• Keep checkbox questions as yes/no facts.</li>
                                <li>• Public templates appear in Latest/Top and tag cloud.</li>
                            </ul>
                        </Card>
                    </div>

                    {/* Mobile sticky save */}
                    <div className="lg:hidden">
                        <Button className="mt-2 w-full" disabled={saving || uploading}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : isEditMode ? (
                                "Save Changes"
                            ) : (
                                "Create Template"
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default TemplateForm;