"use client";

import { useEffect, useState } from "react";
import { BlogList } from "@/components/blog/BlogList";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Edit, Eye, Clock, MoreVertical } from "lucide-react";
import { toast } from "react-toastify";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
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

interface BlogsResponse {
  success: boolean;
  data: {
    blogs: Blog[];
    totalBlogs: number;
    totalPages: number;
    currentPage: number;
    availableTags: string[];
  };
  message: string;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const page = searchParams.get("page") || "1";
      const search = searchParams.get("search");
      const tag = searchParams.get("tag");
      const sortBy = searchParams.get("sortBy") || "newest";

      params.append("page", page);
      params.append("limit", "12");
      if (search) params.append("search", search);
      if (tag) params.append("tag", tag);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await fetch(`/api/blogs?${params.toString()}`);
      const data: BlogsResponse = await response.json();

      if (data.success) {
        setBlogs(data.data.blogs);
        setTotalBlogs(data.data.totalBlogs);
        setTotalPages(data.data.totalPages);
        setCurrentPage(data.data.currentPage);
        setAvailableTags(data.data.availableTags);
      } else {
        setError(data.message || "Failed to fetch blogs");
      }
    } catch (err) {
      setError("An error occurred while fetching blogs");
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchParams]);

  const handleEdit = (blog: Blog) => {
    router.push(`/admin/blogs/${blog._id}/edit`);
  };

  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      setDeletingBlogId(blogToDelete._id);
      const response = await fetch(`/api/blogs/${blogToDelete._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else {
        toast.error(data.message || "Failed to delete blog");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the blog");
      console.error("Error deleting blog:", err);
    } finally {
      setDeletingBlogId(null);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const stats = {
    total: totalBlogs,
    published: blogs.filter((blog) => blog.status === "published").length,
    drafts: blogs.filter((blog) => blog.status === "draft").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage all your blog posts from here.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* title placeholder */}
              <Skeleton className="h-5 w-5 rounded-full" />{" "}
              {/* icon placeholder */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" /> {/* value placeholder */}
              <Skeleton className="h-3 w-32" /> {/* description placeholder */}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        )}
        {isLoading ? (
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* title placeholder */}
              <Skeleton className="h-5 w-5 rounded-full" />{" "}
              {/* icon placeholder */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" /> {/* value placeholder */}
              <Skeleton className="h-3 w-32" /> {/* description placeholder */}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
            </CardContent>
          </Card>
        )}
        {isLoading ? (
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* title placeholder */}
              <Skeleton className="h-5 w-5 rounded-full" />{" "}
              {/* icon placeholder */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" /> {/* value placeholder */}
              <Skeleton className="h-3 w-32" /> {/* description placeholder */}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.drafts}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <BlogFilters availableTags={availableTags} />
      <div className="space-y-6">
        {isLoading ? (
          <BlogList blogs={[]} isLoading={true} />
        ) : error ? (
          <BlogList blogs={[]} error={error} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <motion.div
                key={blog._id}
                whileHover={{ scale: 1.03 }}
                className="transition-all"
              >
                <Card className="h-full flex flex-col hover:shadow-xl shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/${blog.slug}`}
                        target="_blank"
                        className="text-lg font-semibold line-clamp-2 leading-tight hover:text-primary transition-colors"
                      >
                        {blog.title}
                      </Link>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            blog.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {blog.status}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => handleEdit(blog)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(blog)}
                              className="cursor-pointer text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {blog.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-start text-sm text-muted-foreground mt-auto gap-4">
                      <Clock className="h-4 w-4" />
                      <span>{blog.readingTime} min read</span>

                      <Eye className="h-4 w-4" />
                      <span>{blog.viewCount} views</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        {blogs.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
                <Plus className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first blog post.
              </p>
              <Button asChild>
                <Link href="/admin/blogs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalBlogs={totalBlogs}
          blogsPerPage={12}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post &quot;{blogToDelete?.title}&quot; and remove it from the
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingBlogId !== null}
            >
              {deletingBlogId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
