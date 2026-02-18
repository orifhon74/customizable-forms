// src/components/TemplateDetails.js
import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

import { Heart, MessageSquare, Tag, AlertTriangle } from "lucide-react";

function TemplateDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [likeDisabled, setLikeDisabled] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL;
    const { t } = useContext(LanguageContext);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const isAuthed = useMemo(() => !!localStorage.getItem("token"), []);

    useEffect(() => {
        const fetchTemplateDetails = async () => {
            try {
                setError(null);
                setLoading(true);

                // Template (may require auth for private)
                const resp = await fetch(`${API_URL}/api/templates/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!resp.ok) {
                    // Try to show better error
                    if (resp.status === 403) throw new Error("Access denied.");
                    if (resp.status === 404) throw new Error("Template not found.");
                    throw new Error("Failed to fetch template details");
                }

                const data = await resp.json();
                setTemplate(data);
                setLikes(data.likeCount || 0);

                // Comments (public)
                const commentsResp = await fetch(`${API_URL}/api/comments/${id}`);
                if (!commentsResp.ok) throw new Error("Failed to fetch comments");
                const commentsData = await commentsResp.json();
                setComments(commentsData);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        if (API_URL && id) fetchTemplateDetails();
    }, [id, API_URL, token]);

    const handleTagClick = (tagId) => {
        navigate(`/search-results?q=${tagId}&type=tag`);
    };

    const handleLike = async () => {
        if (!isAuthed) {
            setError("You must be logged in to like a template.");
            return;
        }

        try {
            setLikeDisabled(true);

            const resp = await fetch(`${API_URL}/api/likes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ template_id: id }),
            });

            if (!resp.ok) throw new Error("Failed to like template");

            // optimistic update
            setLikes((prev) => prev + 1);
        } catch (err) {
            setError(err.message || "Failed to like template");
        } finally {
            setLikeDisabled(false);
        }
    };

    const handleAddComment = async () => {
        if (!isAuthed) {
            setError("You must be logged in to comment.");
            return;
        }

        if (!commentContent.trim()) {
            setError("Comment content cannot be empty.");
            return;
        }

        try {
            setCommentLoading(true);
            setError(null);

            const resp = await fetch(`${API_URL}/api/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ template_id: id, content: commentContent }),
            });

            if (!resp.ok) throw new Error("Failed to add comment");

            const newComment = await resp.json();
            setComments((prev) => [newComment, ...prev]);
            setCommentContent("");
        } catch (err) {
            setError(err.message || "Failed to add comment");
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                    <Card className="p-6">
                        <Skeleton className="h-7 w-2/3" />
                        <Skeleton className="mt-3 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-5/6" />
                        <div className="mt-4 flex gap-2">
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-7 w-24" />
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <Skeleton className="h-5 w-40" />
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-10/12" />
                        </div>
                    </Card>
                </div>

                <div className="space-y-4 lg:col-span-4">
                    <Card className="p-6">
                        <Skeleton className="h-5 w-32" />
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-10/12" />
                        </div>
                        <Skeleton className="mt-4 h-24 w-full" />
                        <Skeleton className="mt-3 h-9 w-full" />
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Error
                    </div>
                    <div className="mt-1">{error}</div>
                </div>

                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go back
                </Button>
            </div>
        );
    }

    if (!template) return null;

    return (
        <div className="grid gap-4 lg:grid-cols-12">
            {/* Left */}
            <div className="space-y-4 lg:col-span-8">
                <Card className="p-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">{template.title}</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {template.description || "No description"}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="mt-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <Tag className="h-4 w-4" />
                            Tags
                        </div>

                        {template.Tags?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {template.Tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagClick(tag.id)}
                                        className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                        type="button"
                                        title={`View templates for tag: ${tag.name}`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">No tags</div>
                        )}
                    </div>

                    {/* Like */}
                    <div className="mt-6 flex items-center gap-3">
                        <Button onClick={handleLike} disabled={likeDisabled} className="gap-2">
                            <Heart className="h-4 w-4" />
                            {likeDisabled ? "Liking..." : "Like"}
                        </Button>
                        <div className="text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="font-medium">Likes:</span> {likes}
                        </div>
                    </div>
                </Card>

                {/* Questions */}
                <Card className="p-6">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                        <h2 className="text-lg font-semibold">{t("questions") || "Questions"}</h2>
                    </div>

                    <Separator className="my-4" />

                    {template.Questions?.length ? (
                        <ol className="space-y-3">
                            {template.Questions.map((q, index) => (
                                <li key={q.id ?? index} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                        Question {index + 1}
                                    </div>
                                    <div className="mt-1 text-zinc-800 dark:text-zinc-200">{q.question_text}</div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                            No questions available.
                        </div>
                    )}
                </Card>
            </div>

            {/* Right */}
            <div className="space-y-4 lg:col-span-4">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold">{t("comments") || "Comments"}</h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Discuss this template. Comments require login.
                    </p>

                    <Separator className="my-4" />

                    {/* Comments list */}
                    {comments.length ? (
                        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                                >
                                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {comment.User?.username || "Anonymous"}
                                    </div>
                                    <div className="mt-1 text-zinc-700 dark:text-zinc-300">{comment.content}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                            No comments yet.
                        </div>
                    )}

                    <Separator className="my-4" />

                    {/* Add comment */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Add a comment</div>
                        <Textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write something helpful (or spicy, but civilized)."
                        />
                        <Button onClick={handleAddComment} disabled={commentLoading} className="w-full">
                            {commentLoading ? "Submitting..." : "Submit comment"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default TemplateDetails;