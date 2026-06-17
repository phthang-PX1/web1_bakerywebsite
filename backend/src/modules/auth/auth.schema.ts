import { z } from "zod";

const emailSchema = z.string().trim().email().toLowerCase();
const phoneSchema = z.string().trim().min(8).max(20);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const hasEmailOrPhone = (value: { email?: string; phone?: string }) => Boolean(value.email || value.phone);

export const registerBodySchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema
  })
  .refine(hasEmailOrPhone, {
    message: "Email or phone is required",
    path: ["email"]
  });

export const loginBodySchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: z.string().min(1)
  })
  .refine(hasEmailOrPhone, {
    message: "Email or phone is required",
    path: ["email"]
  });

export const contactBodySchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional()
  })
  .refine(hasEmailOrPhone, {
    message: "Email or phone is required",
    path: ["email"]
  });

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1)
});

export const resetPasswordBodySchema = z.object({
  password: passwordSchema
});

export const tokenParamsSchema = z.object({
  token: z.string().min(1)
});
