"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Eye,
  User,
  Calendar,
  Facebook,
  Linkedin,
  Twitter,
  Share2,
  Copy,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatSafeDate } from "@/utils/DateUtils";
import { BlogList } from "@/components/blog/BlogList";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Comments } from "@/components/blog/Comments";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
  content: string;
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

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/blogs/slug/${params.slug}`);
        const data = await response.json();

        if (data.success) {
          setBlog(data.data.blog);

          if (data.data.blog.tags && data.data.blog.tags.length > 0) {
            const tagQuery = data.data.blog.tags[0];
            const relatedRes = await fetch(
              `/api/blogs?tag=${tagQuery}&limit=3`
            );
            const relatedData = await relatedRes.json();
            if (relatedData.success) {
              setRelatedPosts(
                relatedData.data.blogs.filter(
                  (b: BlogPost) => b._id !== data.data.blog._id
                )
              );
            }
          }
        } else {
          setError(data.message || "Blog not found");
        }
      } catch {
        setError("An error occurred while fetching the blog");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);


  const handleShare = async (platform: string) => {
    if (!blog) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog.title);

    const shareLinks: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } else {
      window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Alert variant="destructive">
            <AlertDescription>
              {error || "Blog post not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="container mx-auto px-4 py-12 mt-30">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">
                  {blog.author?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={blog.publishedAt || blog.createdAt}>
                  {formatSafeDate(blog.publishedAt || blog.createdAt)}
                </time>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{blog.readingTime || 1} min read</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{blog.viewCount} views</span>
              </div>
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />
          </header>

          <div
            className="prose prose-lg max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          <Comments blogId={blog._id} />
          <footer className="mt-12 pt-6 border-t flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex flex-col items-start sm:items-end w-full">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share this post
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("twitter")}
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("linkedin")}
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("whatsapp")}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("copy")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </footer>
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Related Posts</h2>
            <BlogList
              blogs={relatedPosts}
              isLoading={isLoading}
              error={error}
              showAuthor={true}
              showActions={false}
              emptyMessage="No published blogs found. Be the first to write something!"
            />
          </section>
        )}

        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/posts">Browse All Posts</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
