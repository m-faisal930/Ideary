"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/blog/BlogForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  metaDescription?: string;
  status: "draft" | "published";
  tags: string[];
}

export default function NewBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: BlogFormData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(
          `Blog ${data.status === "published" ? "published" : "saved as draft"} successfully!`
        );
        router.push("/author/blogs");
      } else {
        toast.error(result.message || "Failed to create blog");
      }
    } catch (error) {
      toast.error("An error occurred while creating the blog");
      console.error("Error creating blog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/author/blogs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Blog Post</h1>
          <p className="text-muted-foreground">
            Write and publish a new blog post.
          </p>
        </div>
      </div>


      <BlogForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitText="Create Blog"
      />
    </div>
  );
}