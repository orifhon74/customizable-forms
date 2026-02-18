// src/components/CreateTemplate.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

import { AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";

function CreateTemplate() {
    const navigate = useNavigate();

    // Basic template fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [topicId, setTopicId] = useState("Other"); // backend mapping expects string
    const [accessType, setAccessType] = useState("public"); // 'public' | 'private'

    // Tags as chips
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    // Unlimited questions
    const [questions, setQuestions] = useState([
        { question_text: "", question_type: "string" },
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    const canSubmit = useMemo(() => {
        if (!title.trim()) return false;
        if (!topicId) return false;
        // allow empty description, imageUrl, tags
        // require at least 1 question with text
        const hasAtLeastOneQuestion = questions.some((q) => q.question_text.trim());
        return hasAtLeastOneQuestion && !submitting;
    }, [title, topicId, questions, submitting]);

    // -----------------------------
    // Tags
    // -----------------------------
    const addTag = (raw) => {
        const cleaned = raw.trim();
        if (!cleaned) return;
        const normalized = cleaned.toLowerCase();
        if (tags.map((t) => t.toLowerCase()).includes(normalized)) return;
        setTags((prev) => [...prev, cleaned]);
    };

    const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

    const onTagKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(tagInput);
            setTagInput("");
        }
        // quick remove last tag with Backspace on empty input
        if (e.key === "Backspace" && !tagInput && tags.length) {
            setTags((prev) => prev.slice(0, -1));
        }
    };

    // -----------------------------
    // Questions
    // -----------------------------
    const addQuestion = () => {
        setQuestions((prev) => [...prev, { question_text: "", question_type: "string" }]);
    };

    const removeQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, patch) => {
        setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    };

    const moveQuestion = (from, to) => {
        if (to < 0 || to >= questions.length) return;
        setQuestions((prev) => {
            const copy = [...prev];
            const item = copy.splice(from, 1)[0];
            copy.splice(to, 0, item);
            return copy;
        });
    };

    // -----------------------------
    // Submit
    // -----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in to create a template.");
            return;
        }

        // prune empty questions
        const prunedQuestions = questions
            .map((q) => ({
                question_text: q.question_text.trim(),
                question_type: q.question_type,
            }))
            .filter((q) => q.question_text.length > 0);

        if (!title.trim()) {
            setError("Title is required.");
            return;
        }
        if (!prunedQuestions.length) {
            setError("Add at least one question.");
            return;
        }

        const requestBody = {
            title: title.trim(),
            description: description?.trim() || "",
            image_url: imageUrl?.trim() || "",
            topic_id: topicId, // string mapping on backend
            access_type: accessType,
            tags, // array of strings
            questions: prunedQuestions,
        };

        try {
            setSubmitting(true);

            const response = await fetch(`${API_URL}/api/templates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || "Failed to create template");
            }

            navigate("/templates");
        } catch (err) {
            console.error("Error creating template:", err);
            setError(err.message || "Failed to create template");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-56px)] bg-zinc-50 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
            <div className="mx-auto w-full max-w-4xl px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Create Template</h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Build a reusable form with unlimited questions, tags, and access control.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4" />
                            <div>{error}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic info */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>Basics</CardTitle>
                            <CardDescription>Title, topic, visibility, and optional image.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title *</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Job Application, Feedback Form..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Topic</label>
                                    <Select value={topicId} onValueChange={setTopicId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select topic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Other">Other</SelectItem>
                                            <SelectItem value="Quiz">Quiz</SelectItem>
                                            <SelectItem value="Feedback">Feedback</SelectItem>
                                            <SelectItem value="Education">Education</SelectItem>
                                            <SelectItem value="Survey">Survey</SelectItem>
                                            <SelectItem value="Job">Job Application</SelectItem>
                                            <SelectItem value="Health">Health</SelectItem>
                                            <SelectItem value="Research">Research</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Short explanation of what this template is for..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL (optional)</label>
                                    <Input
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        type="url"
                                    />
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        If you’re using Firebase uploads elsewhere, you can paste the uploaded URL here.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Private template</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Only you (and admins) can view it.
                                        </div>
                                    </div>
                                    <Switch
                                        checked={accessType === "private"}
                                        onCheckedChange={(checked) => setAccessType(checked ? "private" : "public")}
                                        aria-label="Toggle private"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                            <CardDescription>Type a tag and press Enter.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={onTagKeyDown}
                                placeholder="e.g. hr, dev, onboarding..."
                            />

                            {tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 rounded-sm p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                                aria-label={`Remove tag ${tag}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    No tags yet. Tags help discovery on the home page.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Questions</CardTitle>
                                <CardDescription>Add as many as you want. Empty ones are ignored.</CardDescription>
                            </div>
                            <Button type="button" onClick={addQuestion} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add question
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {questions.map((q, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-full space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Question text</label>
                                                <Input
                                                    value={q.question_text}
                                                    onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                                                    placeholder={`Question ${index + 1}...`}
                                                />
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Type</label>
                                                    <Select
                                                        value={q.question_type}
                                                        onValueChange={(val) => updateQuestion(index, { question_type: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="string">String (single line)</SelectItem>
                                                            <SelectItem value="multiline">Multiline</SelectItem>
                                                            <SelectItem value="integer">Integer</SelectItem>
                                                            <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => moveQuestion(index, index - 1)}
                                                        disabled={index === 0}
                                                        aria-label="Move up"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => moveQuestion(index, index + 1)}
                                                        disabled={index === questions.length - 1}
                                                        aria-label="Move down"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => removeQuestion(index)}
                                                        aria-label="Remove question"
                                                        disabled={questions.length === 1}
                                                        title={questions.length === 1 ? "Keep at least 1 question block" : "Remove"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {q.question_text.trim().length === 0 && (
                                        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                                            Tip: Empty questions are ignored on submit.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>

                        <Button type="submit" disabled={!canSubmit}>
                            {submitting ? "Creating..." : "Create template"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTemplate;