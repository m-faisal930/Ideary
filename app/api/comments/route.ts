import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Comment from "@/models/Comment";
import Blog from "@/models/Blog";
import { apiResponse } from "../../../utils/apiResponse";
import { authenticateUser } from "@/utils/AuthMiddleware";
import {
  createCommentSchema,
  validateCommentData,
} from "@/schemas/comment";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const blogId = url.searchParams.get("blogId");

    if (!blogId) {
      return apiResponse({
        success: false,
        message: "Blog ID is required",
        status: 400,
        errors: ["Blog ID is required"]
      });
    }

    await connectDB();

    const comments = await Comment.find({ blog: blogId })
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .lean();

    const transformedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      author: {
        _id: comment.author._id,
        name: comment.author.username || "Unknown",
        email: comment.author.email || ""
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));

    return apiResponse({
      success: true,
      message: "Comments retrieved successfully",
      data: {
        comments: transformedComments,
        total: comments.length
      }
    });
  } catch  {
    return apiResponse({
      success: false,
      message: "Failed to retrieve comments",
      status: 500
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError) {
      return authError;
    }

    if (!user) {
      return apiResponse({
        success: false,
        message: "Authentication required",
        status: 401
      });
    }

    const body = await req.json();
    const { success, data: commentData, errors } = validateCommentData(createCommentSchema, body);

    if (!success) {
      return apiResponse({
        success: false,
        message: "Invalid comment data",
        status: 400,
        errors: errors || ["Invalid comment data"]
      });
    }

    await connectDB();

    const blog = await Blog.findById(commentData!.blogId);
    if (!blog) {
      return apiResponse({
        success: false,
        message: "Blog not found",
        status: 404
      });
    }

    if (blog.status !== "published") {
      return apiResponse({
        success: false,
        message: "Cannot comment on unpublished blogs",
        status: 403
      });
    }

    const comment = new Comment({
      content: commentData!.content,
      author: user.id,
      blog: commentData!.blogId,
    });

    await comment.save();
    await comment.populate("author", "username email");

    const transformedComment = {
      _id: comment._id,
      content: comment.content,
      author: {
        _id: comment.author._id,
        name: comment.author.username || "Unknown",
        email: comment.author.email || ""
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };

    return apiResponse({
      success: true,
      message: "Comment added successfully",
      data: { comment: transformedComment },
      status: 201
    });
  } catch {
    return apiResponse({
      success: false,
      message: "Failed to create comment",
      status: 500
    });
  }
}
