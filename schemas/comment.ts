import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim(),
  blogId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid blog ID format"),
});

export const commentIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid comment ID format"),
});

export function validateCommentData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ["Validation failed"] };
  }
}

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
