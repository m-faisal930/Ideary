import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Blog from "@/models/Blog";
import { apiResponse } from "../../../../utils/apiResponse";
import { authenticateUser } from "@/utils/AuthMiddleware";
import { z } from "zod";
import { validateBlogData } from "@/schemas/blog";

const bulkUpdateSchema = z.object({
  blogIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid blog ID format"))
    .min(1, "At least one blog ID is required")
    .max(50, "Cannot update more than 50 blogs at once"),
  updates: z.object({
    status: z.enum(["draft", "published"]).optional(),
    tags: z
      .array(
        z
          .string()
          .max(50, "Each tag cannot exceed 50 characters")
          .trim()
          .toLowerCase()
      )
      .max(10, "Cannot have more than 10 tags")
      .optional(),
  }),
});

const bulkDeleteSchema = z.object({
  blogIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid blog ID format"))
    .min(1, "At least one blog ID is required")
    .max(50, "Cannot delete more than 50 blogs at once"),
});

export async function PUT(req: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError) {
      return authError;
    }

    if (!user) {
      return apiResponse({ success: false, message: "Authentication required", status: 401 });
    }

    const body = await req.json();
    const {
      success,
      data: bulkData,
      errors,
    } = validateBlogData(bulkUpdateSchema, body);

    if (!success) {
      return apiResponse({ success: false, message: "Validation failed", status: 400, errors: errors || ["Invalid bulk update data"] });
    }

    await connectDB();

    const blogsToUpdate = await Blog.find({
      _id: { $in: bulkData!.blogIds },
      author: user.id,
    });

    if (blogsToUpdate.length !== bulkData!.blogIds.length) {
      return apiResponse({ success: false, message: "Some blogs were not found or you don't have permission to update them", status: 403 });
    }

    const updateQuery: Record<string, unknown> = {};
    if (bulkData!.updates.status) {
      updateQuery.status = bulkData!.updates.status;
      if (bulkData!.updates.status === "published") {
        updateQuery.publishedAt = new Date();
      } else if (bulkData!.updates.status === "draft") {
        updateQuery.$unset = { publishedAt: 1 };
      }
    }
    if (bulkData!.updates.tags) {
      updateQuery.tags = bulkData!.updates.tags;
    }

    const result = await Blog.updateMany(
      {
        _id: { $in: bulkData!.blogIds },
        author: user.id,
      },
      updateQuery
    );

    return apiResponse({ success: true, message: "Blogs updated successfully", data: { updatedCount: result.modifiedCount, totalRequested: bulkData!.blogIds.length } });
  } catch (error) {
    console.error("Failed to update blogs", error);
    return apiResponse({ success: false, message: "Failed to update blogs", status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError) {
      return authError;
    }

    if (!user) {
      return apiResponse({ success: false, message: "Authentication required", status: 401 });
    }

    const body = await req.json();
    const {
      success,
      data: bulkData,
      errors,
    } = validateBlogData(bulkDeleteSchema, body);

    if (!success) {
      return apiResponse({ success: false, message: "Validation failed", status: 400, errors: errors || ["Invalid bulk delete data"] });
    }

    await connectDB();

    const blogsToDelete = await Blog.find({
      _id: { $in: bulkData!.blogIds },
      author: user.id,
    }).select("_id title slug");

    if (blogsToDelete.length !== bulkData!.blogIds.length) {
      return apiResponse({ success: false, message: "Some blogs were not found or you don't have permission to delete them", status: 403 });
    }

    const result = await Blog.deleteMany({
      _id: { $in: bulkData!.blogIds },
      author: user.id,
    });

    return apiResponse({ success: true, message: "Blogs deleted successfully", data: { deletedCount: result.deletedCount, totalRequested: bulkData!.blogIds.length, deletedBlogs: blogsToDelete.map((blog) => ({ id: blog._id, title: blog.title, slug: blog.slug })) } });
  } catch (error) {
    console.error("Failed to delete blogs", error);
    return apiResponse({ success: false, message: "Failed to delete blogs", status: 500 });
  }
}
