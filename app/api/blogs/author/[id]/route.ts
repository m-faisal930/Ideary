import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Blog from "@/models/Blog";
import User from "@/models/User";
import { apiResponse } from "../../../../../utils/apiResponse";
import { blogQuerySchema, validateBlogData } from "@/schemas/blog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params;

    if (!authorId || !/^[0-9a-fA-F]{24}$/.test(authorId)) {
      return apiResponse({
        success: false,
        message: "Invalid author ID format",
        status: 400,
      });
    }

    const url = new URL(req.url);
    const queryParams: Record<string, string> = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
      status: "published", 
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

    // Fetch author information
    const author = await User.findById(authorId).select("-password");
    if (!author) {
      return apiResponse({
        success: false,
        message: "Author not found",
        status: 404,
      });
    }

    // Build filter for blogs
    const filter: Record<string, unknown> = {
      author: authorId,
      status: "published", 
    };

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


    const allTags = await Blog.distinct("tags", {
      author: authorId,
      status: "published",
    });

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
      author: {
        _id: author._id,
        username: author.username,
        email: author.email,
        joinedAt: author.createdAt,
      },
      blogs: transformedBlogs,
      totalBlogs: totalCount || 0,
      totalPages: totalPages || 0,
      currentPage: page || 1,
      availableTags: Array.isArray(allTags) ? allTags : [],
    };

    return apiResponse({
      success: true,
      message: "Author profile and blogs retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to retrieve author profile", error);
    return apiResponse({
      success: false,
      message: "Failed to retrieve author profile",
      status: 500,
    });
  }
}