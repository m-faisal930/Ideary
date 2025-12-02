import { BlogCard } from "./BlogCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags?: string[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  readingTime: number;
  viewCount: number;
}

interface BlogListProps {
  blogs: Blog[];
  error?: string | null;
  showAuthor?: boolean;
  showActions?: boolean;
  onEdit?: (blog: Blog) => void;
  onDelete?: (blog: Blog) => void;
  emptyMessage?: string;
}

export function BlogList({
  blogs,
  error = null,
  showAuthor = true,
  showActions = false,
  onEdit,
  onDelete,
  emptyMessage = "No blogs found."
}: BlogListProps) {

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard
          key={blog._id}
          blog={blog}
          showAuthor={showAuthor}
          showActions={showActions}
          onEdit={() => onEdit?.(blog)}
          onDelete={() => onDelete?.(blog)}
        />
      ))}
    </div>
  );
}