"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatSafeDate } from "@/utils/DateUtils";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CommentsProps {
  blogId: string;
}

export function Comments({ blogId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/comments?blogId=${blogId}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data.comments);
      } else {
        setError(data.message || "Failed to load comments");
      }
    } catch {
      setError("An error occurred while loading comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          blogId: blogId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Comment added successfully");
        setNewComment("");
        fetchComments();
      } else {
        toast.error(data.message || "Failed to add comment");
      }
    } catch {
      toast.error("An error occurred while adding comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Comment deleted successfully");
        fetchComments();
      } else {
        toast.error(data.message || "Failed to delete comment");
      }
    } catch {
      toast.error("An error occurred while deleting comment");
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="curosor-pointer"
            onClick={() => setShowComments(!showComments)}
          >
            {showComments ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {showComments && (
        <CardContent className="space-y-6">
          {user && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {newComment.length}/1000
                </span>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isSubmitting || !newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          )}

          {!user && (
            <Alert>
              <AlertDescription>
                Please login to leave a comment
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment._id} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {comment.author?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatSafeDate(comment.createdAt)}
                        </p>
                      </div>
                      {user && user.id === comment.author?._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
