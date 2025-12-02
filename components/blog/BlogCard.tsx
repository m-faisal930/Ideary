"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Clock, User } from "lucide-react";
import { formatSafeDate } from "@/utils/DateUtils";
import { motion } from "framer-motion";

interface BlogCardProps {
  blog: {
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
  };
  showAuthor?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BlogCard({
  blog,
  showAuthor = true,
  showActions = false,
  onEdit,
  onDelete,
}: BlogCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="transition-all">
      <Card className="h-full flex flex-col hover:shadow-xl shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl font-semibold line-clamp-2 leading-tight">
              <Link
                href={`/${blog.slug}`}
                className="hover:text-primary transition-colors"
              >
                {blog.title}
              </Link>
            </CardTitle>
            {blog.status === "draft" && (
              <Badge variant="secondary" className="shrink-0">
                Draft
              </Badge>
            )}
          </div>

          {showAuthor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <Link
                href={`/author/${blog.author._id}`}
                className="hover:underline"
              >
                {" "}
                <span>{blog.author.name}</span>
              </Link>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags &&
              blog.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            {blog.tags && blog.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{blog.tags.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readingTime} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{blog.viewCount} views</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <time className="text-sm text-muted-foreground">
                {formatSafeDate(blog.publishedAt || blog.createdAt)}
              </time>

              {showActions && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={onEdit}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
