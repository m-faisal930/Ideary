"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlogList } from "@/components/blog/BlogList";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  Mail,
  Calendar,
  MessageCircle,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { formatSafeDate } from "@/utils/DateUtils";

interface AuthorData {
  _id: string;
  username: string;
  email: string;
  joinedAt: string;
}

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

interface ApiResponse {
  author: AuthorData;
  blogs: Blog[];
  totalBlogs: number;
  totalPages: number;
  currentPage: number;
  availableTags: string[];
}

export default function AuthorProfilePage() {
  const params = useParams();
  const authorId = params.id as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthorData();
  }, [authorId]);

  const fetchAuthorData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL(
        `/api/blogs/author/${authorId}`,
        window.location.origin
      );

      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load author profile");
      }
    } catch (err) {
      setError("An error occurred while loading the author profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      fetchAuthorData();
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [authorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 mt-30">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
          <BlogList blogs={[]} isLoading={true} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Failed to load author profile"}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const { author, blogs, totalBlogs, totalPages, currentPage, availableTags } =
    data;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-30">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <User className="h-12 w-12" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold mb-2">{author.username}</h1>

                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{author.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Joined {formatSafeDate(author.joinedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {totalBlogs} {totalBlogs === 1 ? "Post" : "Posts"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="default" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Follow
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Posts by {author.username}
            </h2>
          </div>

          <BlogFilters availableTags={availableTags} />

          {blogs.length > 0 ? (
            <>
              <BlogList
                blogs={blogs}
                isLoading={false}
                showAuthor={false}
                emptyMessage={`${author.username} hasn't published any posts yet.`}
              />

              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalBlogs={totalBlogs}
                blogsPerPage={10}
              />
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <div className="mx-auto max-w-md">
                  <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    {author.username} hasn&apos;t published any posts yet.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
