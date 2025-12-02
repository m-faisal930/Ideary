import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .trim(),
  excerpt: z
    .string()
    .max(300, "Excerpt cannot exceed 300 characters")
    .trim()
    .optional(),
  tags: z
    .array(
      z
        .string()
        .max(50, "Each tag cannot exceed 50 characters")
        .trim()
        .toLowerCase()
    )
    .max(10, "Cannot have more than 10 tags")
    .optional()
    .default([]),
  status: z
    .enum(["draft", "published"])
    .optional()
    .default("draft"),
});

export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title cannot exceed 200 characters")
    .trim()
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .trim()
    .optional(),
  excerpt: z
    .string()
    .max(300, "Excerpt cannot exceed 300 characters")
    .trim()
    .optional(),
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
  status: z
    .enum(["draft", "published"])
    .optional(),
});

export const blogQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be a positive number")
    .optional()
    .default(() => 1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50")
    .optional()
    .default(() => 10),
  status: z
    .enum(["draft", "published", "all"])
    .optional()
    .default("all"),
  tags: z
    .string()
    .transform((val) => val.split(",").map((tag) => tag.trim().toLowerCase()))
    .optional(),
  search: z
    .string()
    .min(1, "Search term must be at least 1 character")
    .optional(),
});

export const blogIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid blog ID format"),
});

export const blogSlugSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
});

export function validateBlogData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ["Validation failed"] };
  }
}

export const blogFilterSchema = z.object({
  author: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID format")
    .optional(),
  status: z
    .enum(["draft", "published"])
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
  dateFrom: z
    .string()
    .datetime()
    .optional(),
  dateTo: z
    .string()
    .datetime()
    .optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogQueryInput = z.infer<typeof blogQuerySchema>;
export type BlogFilterInput = z.infer<typeof blogFilterSchema>;