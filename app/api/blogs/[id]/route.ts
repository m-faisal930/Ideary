import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Blog from "@/models/Blog";
import { apiResponse } from "../../../../utils/apiResponse";
import {
  authenticateUser,
  authorizeResourceOwner,
} from "@/utils/AuthMiddleware";
import {
  updateBlogSchema,
  blogIdSchema,
  validateBlogData,
} from "@/schemas/blog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { success: idValid, errors: idErrors } = validateBlogData(
      blogIdSchema,
      { id }
    );

    if (!idValid) {
      return apiResponse({ success: false, message: "Validation failed", status: 400, errors: idErrors || ["Invalid blog ID"] });
    }

    const { user, error: authError } = await authenticateUser(req);
    if (authError) {
      return authError;
    }

    if (!user) {
      return apiResponse({ success: false, message: "Authentication required", status: 401 });
    }

    await connectDB();

    const blog = await Blog.findById(id).populate("author", "username email");

    if (!blog) {
      return apiResponse({ success: false, message: "Blog not found", status: 404 });
    }

    if (blog.author._id.toString() !== user.id) {
      return apiResponse({ success: false, message: "Access denied: You can only view your own blogs", status: 403 });
    }

    return apiResponse({ success: true, message: "Blog retrieved successfully", data: { blog } });
  } catch (error) {
    console.error("Failed to retrieve blog", error);
    return apiResponse({ success: false, message: "Failed to retrieve blog", status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { success: idValid, errors: idErrors } = validateBlogData(
      blogIdSchema,
      { id }
    );

    if (!idValid) {
      return apiResponse({ success: false, message: "Validation failed", status: 400, errors: idErrors || ["Invalid blog ID"] });
    }

    const { user, error: authError } = await authenticateUser(req);
    if (authError) {
      return authError;
    }

    if (!user) {
      return apiResponse({ success: false, message: "Authentication required", status: 401 });
    }

    await connectDB();

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      return apiResponse({ success: false, message: "Blog not found", status: 404 });
    }

    const { authorized, error: authzError } = await authorizeResourceOwner(
      req,
      existingBlog.author.toString()
    );

    if (!authorized) return authzError;

    const body = await req.json();
    const {
      success,
      data: updateData,
      errors,
    } = validateBlogData(updateBlogSchema, body);

    if (!success) {
      return apiResponse({ success: false, message: "Validation failed", status: 400, errors: errors || ["Invalid update data"] });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { ...updateData },
      {
        new: true,
        runValidators: true,
      }
    ).populate("author", "username email");

    return apiResponse({ success: true, message: "Blog updated successfully", data: { blog: updatedBlog } });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000 &&
      "keyPattern" in error &&
      (error.keyPattern as Record<string, unknown>)?.slug
    ) {
      return apiResponse({ success: false, message: "A blog with a similar title already exists", status: 409 });
    }
    console.error("Failed to update blog", error);
    return apiResponse({ success: false, message: "Failed to update blog", status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { success: idValid, errors: idErrors } = validateBlogData(
      blogIdSchema,
      { id }
    );

    if (!idValid) {
      return apiResponse({ success: false, message: "Validation failed", status: 400, errors: idErrors || ["Invalid blog ID"] });
    }

    const { user, error: authError } = await authenticateUser(req);
    if (authError) {
      return authError;
    }

    if (!user) {
      return apiResponse({ success: false, message: "Authentication required", status: 401 });
    }

    await connectDB();

    const blog = await Blog.findById(id);

    if (!blog) {
      return apiResponse({ success: false, message: "Blog not found", status: 404 });
    }

    const { authorized, error: authzError } = await authorizeResourceOwner(
      req,
      blog.author.toString()
    );

    if (!authorized) return authzError;

    await Blog.findByIdAndDelete(id);

    return apiResponse({ success: true, message: "Blog deleted successfully", data: { deletedBlog: { id: blog._id, title: blog.title, slug: blog.slug } } });
  } catch (error) {
    console.error("Failed to delete blog", error);
    return apiResponse({ success: false, message: "Failed to delete blog", status: 500 });
  }
}
