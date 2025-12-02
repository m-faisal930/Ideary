import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Comment from "@/models/Comment";
import { apiResponse } from "../../../../utils/apiResponse";
import { authenticateUser } from "@/utils/AuthMiddleware";

export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const [comments, totalCount] = await Promise.all([
      Comment.find()
        .populate("author", "username email")
        .populate("blog", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(),
    ]);

    const transformedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      author: {
        _id: comment.author._id,
        username: comment.author.username || "Unknown",
        email: comment.author.email || ""
      },
      blog: {
        _id: comment.blog._id,
        title: comment.blog.title,
        slug: comment.blog.slug
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return apiResponse({
      success: true,
      message: "Comments retrieved successfully",
      data: {
        comments: transformedComments,
        pagination: {
          totalComments: totalCount,
          totalPages,
          page,
          limit
        }
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

export async function DELETE(req: NextRequest) {
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
    const commentId = body.id;

    if (!commentId) {
      return apiResponse({
        success: false,
        message: "Comment ID is required",
        status: 400
      });
    }

    await connectDB();

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return apiResponse({
        success: false,
        message: "Comment not found",
        status: 404
      });
    }

    return apiResponse({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch {
    return apiResponse({
      success: false,
      message: "Failed to delete comment",
      status: 500
    });
  }
}
