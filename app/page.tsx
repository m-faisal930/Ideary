"use client";

import { BlogList } from "@/components/blog/BlogList";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/layout/Hero";
import Link from "next/link";

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

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBlogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: "1",
        limit: "3",
        status: "published",
        sortBy: "newest",
      });

      const response = await fetch(`/api/blogs?${params.toString()}`);
      const data: BlogsResponse = await response.json();

      if (data.success) {
        setBlogs(data.data.blogs);
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
    fetchLatestBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="mx-auto px-10 py-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Latest Stories
        </h2>

        <BlogList
          blogs={blogs}
          isLoading={isLoading}
          error={error}
          showAuthor={true}
          showActions={false}
          emptyMessage="No published blogs found. Be the first to write something!"
        />

        {!isLoading && blogs.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/posts"
              className="inline-block rounded-md bg-primary px-6 py-3 text-white font-medium hover:bg-blue-dark transition-colors"
            >
              Read More Posts
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
