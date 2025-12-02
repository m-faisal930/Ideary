
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(8)
    .regex(/[A-Z]/, "Must have an uppercase letter")
    .regex(/[0-9]/, "Must have a number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8)
    .regex(/[A-Z]/, "Must have an uppercase letter")
    .regex(/[0-9]/, "Must have a number"),
});
