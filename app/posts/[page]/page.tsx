import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BlogList } from "@/components/blog/publicView/BlogList";
import { BlogFilters } from "@/components/blog/publicView/BlogFilters";
import { BlogPagination } from "@/components/blog/publicView/BlogPagination";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideary Blog",
  description: "Discover insightful articles, tutorials, and stories from our community of writers",
};

interface PageParams {
  page: string;
}

interface PageProps {
  params: PageParams;
  searchParams: {
    search?: string;
    tag?: string;
    sortBy?: string;
  };
}

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
  author: { _id: string; name: string; email: string };
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

const blogsPerPage = 9;

function getBaseUrl() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return "http://localhost:3000";
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/blogs?status=published&page=1&limit=${blogsPerPage}`
    );
    const data: BlogsResponse = await res.json();
    const totalPages = data?.data?.totalPages ?? 1;

    return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }));
  } catch (err) {
    console.error("generateStaticParams failed:", err);
    return [{ page: "1" }];
  }
}

export default async function PostsPage({ params, searchParams }: PageProps) {
  const currentPage = Number(params.page) || 1;
  const search = searchParams.search || "";
  const tag = searchParams.tag || "";
  const sortBy = searchParams.sortBy || "newest";

  let error: string | null = null;
  let blogs: Blog[] = [];
  let totalPages = 1;
  let totalBlogs = 0;
  let availableTags: string[] = [];

  try {
    const apiParams = new URLSearchParams();
    apiParams.set("status", "published");
    apiParams.set("page", currentPage.toString());
    apiParams.set("limit", blogsPerPage.toString());
    
    if (search) apiParams.set("search", search);
    if (tag) apiParams.set("tag", tag);
    if (sortBy) apiParams.set("sortBy", sortBy);

    const res = await fetch(
      `${getBaseUrl()}/api/blogs?${apiParams.toString()}`,
      {
        next: { revalidate: 300 }
      }
    );

    const data: BlogsResponse = await res.json();

    if (data.success) {
      blogs = data.data.blogs;
      totalPages = data.data.totalPages;
      totalBlogs = data.data.totalBlogs;
      availableTags = data.data.availableTags;
    } else {
      error = data.message || "Failed to fetch blogs";
    }
  } catch (err) {
    console.error("Error fetching blogs:", err);
    error = "Error fetching blogs";
  }

  const basePath = "/posts/1";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-r from-primary/10 to-primary/5 pb-16 font-sans mt-30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Stories
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore insightful articles, tutorials, and stories from our
            community of writers
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <BlogFilters
          availableTags={availableTags}
          currentSearch={search}
          currentTag={tag || "all"}
          currentSort={sortBy}
          basePath={basePath}
        />

        <BlogList
          blogs={blogs}
          error={error}
          showAuthor={true}
          showActions={false}
          emptyMessage="No published blogs found. Be the first to write something!"
        />

        {totalPages > 1 && (
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalBlogs={totalBlogs}
            blogsPerPage={blogsPerPage}
            basePath="/posts"
            searchParams={{
              ...(search && { search }),
              ...(tag && { tag }),
              ...(sortBy !== "newest" && { sortBy }),
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}