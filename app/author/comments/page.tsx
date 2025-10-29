"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, MessageSquare, User, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { formatSafeDate } from "@/utils/DateUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  blog: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalComments: number;
  totalPages: number;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalComments: 0,
    totalPages: 1,
  });

  const fetchComments = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/author/comments?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data.comments);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch comments");
      }
    } catch {
      setError("An error occurred while fetching comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/author/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Comment deleted successfully");
        setComments(comments.filter((c) => c._id !== deleteId));
        setPagination((prev) => ({
          ...prev,
          totalComments: prev.totalComments - 1,
        }));
      } else {
        toast.error(data.message || "Failed to delete comment");
      }
    } catch {
      toast.error("An error occurred while deleting the comment");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Manage Comments
        </h1>
        <div className="text-sm text-muted-foreground">
          Total: {pagination.totalComments} comment(s)
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {comments.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {comments.map((comment) => (
              <Card key={comment._id} className="hover:shadow-lg hover:bg-muted/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-lg font-semibold">
                        {comment.blog.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {comment.author.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatSafeDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(comment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto cursor-pointer"
                      onClick={() =>
                        window.open(`/${comment.blog.slug}`, "_blank")
                      }
                    >
                      View Blog Post →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => fetchComments(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchComments(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
