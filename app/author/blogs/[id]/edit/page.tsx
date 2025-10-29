"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BlogForm } from "@/components/blog/BlogForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  metaDescription?: string;
  status: "draft" | "published";
  tags: string[];
}

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  metaDescription?: string;
  slug: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/blogs/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setBlog(data.data.blog);
        } else {
          setError(data.message || "Blog not found");
        }
      } catch (err) {
        setError("An error occurred while fetching the blog");
        console.error("Error fetching blog:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  const handleSubmit = async (data: BlogFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/blogs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Blog ${data.status === "published" ? "published" : "updated"} successfully!`
        );
        router.push("/author/blogs");
      } else {
        toast.error(result.message || "Failed to update blog");
      }
    } catch (error) {
      toast.error("An error occurred while updating the blog");
      console.error("Error updating blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/author/blogs">
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Blog Post
            </h1>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Blog post not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/author/blogs">
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-muted-foreground">
            Update &quot;{blog.title}&quot;
          </p>
        </div>
      </div>

      <BlogForm
        initialData={{
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          metaDescription: blog.metaDescription,
          status: blog.status,
          tags: blog.tags,
        }}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitText="Update Blog"
      />
    </div>
  );
}
