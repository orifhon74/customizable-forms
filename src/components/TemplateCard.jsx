// src/components/TemplateCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card";

export default function TemplateCard({
                                         template,
                                         showAuthor = false,
                                         showFormsFilled = false,
                                         isAuthenticated,
                                         onLike,
                                         viewHref,
                                         fillHref,
                                     }) {
    const navigate = useNavigate();

    const title = template?.title ?? "Untitled";
    const description = template?.description ?? "";
    const imageUrl = template?.image_url;
    const likeCount = template?.likeCount ?? 0;

    const author = template?.User?.username ?? "Unknown";
    const formsFilled = template?.forms_count ?? 0;

    return (
        <Card className="overflow-hidden">
            {/* Image */}
            {imageUrl ? (
                <div className="h-36 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="flex h-36 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    No image
                </div>
            )}

            <CardHeader>
                <CardTitle className="line-clamp-1">{title}</CardTitle>
                <CardDescription className="line-clamp-2">{description || "No description"}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
                {showAuthor && (
                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium">Author:</span> {author}
                    </div>
                )}

                {showFormsFilled && (
                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium">Forms filled:</span> {formsFilled}
                    </div>
                )}

                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">Likes:</span> {likeCount}
                </div>
            </CardContent>

            <CardFooter className="gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onLike?.(template.id)}
                    title="Like this template"
                    aria-label="Like template"
                >
                    <Heart className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(viewHref)}
                >
                    View details
                </Button>

                {isAuthenticated && (
                    <Link to={fillHref} className="flex-1">
                        <Button className="w-full" variant="default">
                            <FileText className="mr-2 h-4 w-4" />
                            Fill out
                        </Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}