import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Blog from "@/models/Blog";
import { apiResponse } from "../../../../../utils/apiResponse";
import { authenticateUser } from "@/utils/AuthMiddleware";
import { blogSlugSchema, validateBlogData } from "@/schemas/blog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { success: slugValid, errors: slugErrors } = validateBlogData(
      blogSlugSchema,
      { slug }
    );

    if (!slugValid) {
      return apiResponse({
        success: false,
        message: "Validation failed",
        status: 400,
        errors: slugErrors || ["Invalid blog slug"],
      });
    }

    const { user, error: authError } = await authenticateUser(req);

    await connectDB();

    const blog = await Blog.findOne({ slug }).populate(
      "author",
      "username email"
    );

    if (!blog) {
      return apiResponse({ success: false, message: "Blog not found", status: 404 });
    }

    if (blog.status !== "published") {
      if (authError) {
        return authError;
      }

      if (!user) {
        return apiResponse({ success: false, message: "Authentication required", status: 401 });
      }

      if (blog.author._id.toString() !== user.id) {
        return apiResponse({ success: false, message: "Unauthorized to view this blog", status: 403 });
      }
    }

    await Blog.findByIdAndUpdate(blog._id, { $inc: { viewCount: 1 } });

    const blogObj = blog.toObject();

    const transformedBlog = {
      ...blogObj,
      excerpt: blogObj.excerpt || "",
      author: {
        _id: blogObj.author?._id || "",
        name: blogObj.author?.username || "Unknown",
        email: blogObj.author?.email || "",
      },
      tags: Array.isArray(blogObj.tags) ? blogObj.tags : [],
      readingTime: blogObj.readingTime || 1,
      viewCount: (blogObj.viewCount || 0) + 1,
      publishedAt: blogObj.publishedAt || null,
      createdAt: blogObj.createdAt || new Date().toISOString(),
      updatedAt: blogObj.updatedAt || new Date().toISOString(),
    };

    return apiResponse({ success: true, message: "Blog found", data: { blog: transformedBlog } });
  } catch (error) {
    console.error("Failed to retrieve blog", error);
    return apiResponse({ success: false, message: "Failed to retrieve blog", status: 500 });
  }
}
