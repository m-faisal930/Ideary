"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Eye,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Star,
} from "lucide-react";
import AnalyticsLineChart from "../api/comments/analytics/LIneChart";
import MetricCard from "../api/comments/analytics/MetricCard";

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalViews: number;
  totalReadingTime: number;
}

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

interface AnalyticsData {
  date: string;
  posts: number;
  views: number;
  readingTime: number;
}

interface PerformanceMetrics {
  totalViews: number;
  avgViews: number;
  engagementRate: number;
  totalReadingTime: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    totalReadingTime: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [topBlogs, setTopBlogs] = useState<Blog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      totalViews: 0,
      avgViews: 0,
      engagementRate: 0,
      totalReadingTime: 0,
    });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [recentBlogsResponse, topBlogsResponse, analyticsResponse] =
          await Promise.all([
            fetch("/api/blogs?limit=5&sortBy=newest"),
            fetch("/api/blogs?limit=3&sortBy=popular"),
            fetch("/api/analytics"),
          ]);

        const recentBlogsData = await recentBlogsResponse.json();
        const topBlogsData = await topBlogsResponse.json();
        const analyticsData = await analyticsResponse.json();

        if (recentBlogsData.success) {
          const blogs = recentBlogsData.data.blogs;
          setRecentBlogs(blogs);

          const totalBlogs = recentBlogsData.data.totalBlogs || 0;
          const publishedBlogs = blogs.filter(
            (blog: Blog) => blog.status === "published"
          ).length;
          const draftBlogs = blogs.filter(
            (blog: Blog) => blog.status === "draft"
          ).length;
          const totalViews = blogs.reduce(
            (sum: number, blog: Blog) => sum + blog.viewCount,
            0
          );
          const totalReadingTime = blogs.reduce(
            (sum: number, blog: Blog) => sum + blog.readingTime,
            0
          );

          setStats({
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            totalViews,
            totalReadingTime,
          });
        }

        if (topBlogsData.success) {
          setTopBlogs(topBlogsData.data.blogs);
        }

        if (analyticsData.success) {
          setAnalyticsData(analyticsData.data.dailyTrends);
          setPerformanceMetrics(analyticsData.data.performanceMetrics);
        }

        if (!recentBlogsData.success && !analyticsData.success) {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("An error occurred while fetching dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const BlogCard = ({
    blog,
    showViews = false,
  }: {
    blog: Blog;
    showViews?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="transition-all cursor-pointer"
    >
      <Card className="hover:shadow-md transition-shadow duration-300 h-full">
        <CardContent className="p-4">
          <div
            className="h-full flex flex-col"
            onClick={() => window.open(`/${blog.slug}`, "_blank")}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium line-clamp-2 flex-1 mr-2">
                {blog.title}
              </h3>
              <Badge
                variant={blog.status === "published" ? "default" : "secondary"}
                className="shrink-0"
              >
                {blog.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
              {blog.excerpt}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{blog.readingTime} min</span>
                </div>
                {showViews && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{blog.viewCount}</span>
                  </div>
                )}
              </div>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your blog activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Blogs"
          value={stats.totalBlogs}
          description={`${stats.publishedBlogs} published, ${stats.draftBlogs} drafts`}
          trend={5}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />

        <MetricCard
          title="Total Views"
          value={performanceMetrics.totalViews.toLocaleString()}
          description="Across all published posts"
          trend={12}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />

        <MetricCard
          title="Avg. Engagement"
          value={`${performanceMetrics.engagementRate}%`}
          description="Reader engagement rate"
          trend={8}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />

        <MetricCard
          title="Content Value"
          value={`${performanceMetrics.totalReadingTime}h`}
          description="Total reading time created"
          trend={15}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Posts & Views Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                  Loading chart...
                </div>
              </div>
            ) : (
              <AnalyticsLineChart
                data={analyticsData}
                dataKey="posts"
                color="var(--primary)"
                title="Daily Posts Created"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Views Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                  Loading chart...
                </div>
              </div>
            ) : (
              <AnalyticsLineChart
                data={analyticsData}
                dataKey="views"
                color="var(--chart-1)"
                title="Daily Views"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Posts
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/blogs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="skeleton h-12 w-12 rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-4 w-3/4"></div>
                      <div className="skeleton h-3 w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-muted-foreground text-center py-8">{error}</p>
            ) : recentBlogs.length > 0 ? (
              <div className="space-y-4">
                {recentBlogs.slice(0, 5).map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No blog posts yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/blogs/new">
                    Create your first blog post
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/blogs?sort=popular">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="skeleton h-12 w-12 rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-4 w-3/4"></div>
                      <div className="skeleton h-3 w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-muted-foreground text-center py-8">{error}</p>
            ) : topBlogs.length > 0 ? (
              <div className="space-y-4">
                {topBlogs.slice(0, 5).map((blog, index) => (
                  <div key={blog._id} className="relative">
                    {index < 3 && (
                      <div className="absolute -left-2 -top-2 z-10">
                        <Badge
                          variant="default"
                          className="rounded-full w-6 h-6 p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                    )}
                    <BlogCard key={blog._id} blog={blog} showViews={true} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No performance data yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Posts will appear here as they get views.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
