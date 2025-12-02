import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Comment from "@/models/Comment";
import { apiResponse } from "../../../../utils/apiResponse";
import { authenticateUser } from "@/utils/AuthMiddleware";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await connectDB();

    const comment = await Comment.findById(id);

    if (!comment) {
      return apiResponse({
        success: false,
        message: "Comment not found",
        status: 404
      });
    }

    if (comment.author.toString() !== user.id) {
      return apiResponse({
        success: false,
        message: "Unauthorized to delete this comment",
        status: 403
      });
    }

    await Comment.findByIdAndDelete(id);

    return apiResponse({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch  {
    return apiResponse({
      success: false,
      message: "Failed to delete comment",
      status: 500
    });
  }
}
