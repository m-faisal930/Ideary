import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Blog from "@/models/Blog";
import { apiResponse } from "../../../utils/apiResponse";
import { authenticateUser } from "@/utils/AuthMiddleware";
import {
  createBlogSchema,
  blogQuerySchema,
  validateBlogData,
} from "@/schemas/blog";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
      status: url.searchParams.get("status") || "all",
    };

    const tags = url.searchParams.get("tags");
    if (tags) queryParams.tags = tags;

    const search = url.searchParams.get("search");
    if (search) queryParams.search = search;

    const {
      success: queryValid,
      data: queryData,
      errors: queryErrors,
    } = validateBlogData(blogQuerySchema, queryParams);

    if (!queryValid) {
      return apiResponse({
        success: false,
        message: "Validation failed",
        status: 400,
        errors: queryErrors || ["Invalid query parameters"],
      });
    }

    await connectDB();

    const filter: Record<string, unknown> = {};
    let requireAuth = true;

    if (queryData!.status === "published") {
      filter.status = "published";
      requireAuth = false;
    } else {
      const { user, error: authError } = await authenticateUser(req);
      if (authError) return authError;

      if (!user) {
        return apiResponse({
          success: false,
          message: "Authentication required",
          status: 401,
        });
      }

      filter.author = user.id;

      if (queryData!.status !== "all") {
        filter.status = queryData!.status;
      }
    }

    if (queryData!.tags && queryData!.tags.length > 0) {
      filter.tags = { $in: queryData!.tags };
    }

    if (queryData!.search) {
      filter.$or = [
        { title: { $regex: queryData!.search, $options: "i" } },
        { content: { $regex: queryData!.search, $options: "i" } },
      ];
    }

    const page = queryData!.page || 1;
    const limit = queryData!.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = url.searchParams.get("sortBy") || "newest";
    let sortQuery: Record<string, 1 | -1> = {};

    switch (sortBy) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "popular":
        sortQuery = { viewCount: -1 };
        break;
      case "title":
        sortQuery = { title: 1 };
        break;
      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const [blogs, totalCount] = await Promise.all([
      Blog.find(filter)
        .select("-content")
        .populate("author", "username email")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);

    const allTags = await Blog.distinct(
      "tags",
      requireAuth ? { author: filter.author } : { status: "published" }
    );

    const totalPages = Math.ceil(totalCount / limit);

    const transformedBlogs = blogs.map((blog) => {
      const blogObj = blog.toObject();

      return {
        _id: blogObj._id,
        title: blogObj.title || "Untitled",
        excerpt: blogObj.excerpt || "",
        slug: blogObj.slug || "",
        tags: Array.isArray(blogObj.tags) ? blogObj.tags : [],
        status: blogObj.status || "draft",
        publishedAt: blogObj.publishedAt || null,
        createdAt: blogObj.createdAt || new Date().toISOString(),
        readingTime: blogObj.readingTime || 1,
        viewCount: blogObj.viewCount || 0,
        author: {
          _id: blogObj.author?._id || "",
          name: blogObj.author?.username || "Unknown",
          email: blogObj.author?.email || "",
        },
      };
    });

    const responseData = {
      blogs: transformedBlogs,
      totalBlogs: totalCount || 0,
      totalPages: totalPages || 0,
      currentPage: page || 1,
      availableTags: Array.isArray(allTags) ? allTags : [],
    };

    return apiResponse({
      success: true,
      message: "Blogs retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to retrieve blogs", error);
    return apiResponse({
      success: false,
      message: "Failed to retrieve blogs",
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError) return authError;

    if (!user) {
      return apiResponse({
        success: false,
        message: "Authentication required",
        status: 401,
      });
    }

    const body = await req.json();
    const {
      success,
      data: blogData,
      errors,
    } = validateBlogData(createBlogSchema, body);

    if (!success) {
      return apiResponse({
        success: false,
        message: "Validation failed",
        status: 400,
        errors: errors || ["Invalid blog data"],
      });
    }

    await connectDB();

    const blog = new Blog({
      ...blogData,
      author: user.id,
    });

    await blog.save();

    await blog.populate("author", "username email");

    return apiResponse({
      success: true,
      message: "Blog created successfully",
      data: { blog },
      status: 201,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000 &&
      "keyPattern" in error &&
      (error.keyPattern as Record<string, unknown>)?.slug
    ) {
      return apiResponse({
        success: false,
        message: "A blog with a similar title already exists",
        status: 409,
      });
    }

    console.error("Failed to create blog", error);
    return apiResponse({
      success: false,
      message: "Failed to create blog",
      status: 500,
    });
  }
}
