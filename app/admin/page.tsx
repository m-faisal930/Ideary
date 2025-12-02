'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, FileText, MessageSquare, TrendingUp, Eye, Calendar } from 'lucide-react';

interface Analytics {
  overview: {
    totalUsers: number;
    totalAuthors: number;
    totalPosts: number;
    totalComments: number;
    publishedPosts: number;
    draftPosts: number;
  };
  recent: {
    users: number;
    posts: number;
    comments: number;
  };
  growth: {
    users: number;
    posts: number;
    comments: number;
  };
  popularPosts: Array<{
    _id: string;
    title: string;
    commentCount: number;
    viewCount: number;
    author: { name: string };
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    user: string;
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await fetch('/api/admin/analytics');
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management console</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/authors">
              <Users className="h-4 w-4 mr-2" />
              Manage Authors
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/posts">
              <FileText className="h-4 w-4 mr-2" />
              Manage Posts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Manage Comments
            </Link>
          </Button>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.overview.totalAuthors || 0} authors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.overview.publishedPosts || 0} published, {analytics?.overview.draftPosts || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.totalComments || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.recent.comments || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{analytics?.growth.users?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              User growth this week
            </p>
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Posts
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/posts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {analytics?.popularPosts?.length ? (
              <div className="space-y-4">
                {analytics.popularPosts.map((post, index) => (
                  <div key={post._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {post.author.name} • {post.commentCount} comments
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Eye className="h-3 w-3 mr-1" />
                      {post.viewCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.recentActivity?.length ? (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'user' && <Users className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'post' && <FileText className="h-4 w-4 text-green-500" />}
                      {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
