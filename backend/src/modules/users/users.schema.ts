import { z } from "zod";

const phoneSchema = z.string().trim().min(8).max(20);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const atLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);

export const updateProfileBodySchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: phoneSchema.nullable().optional()
  })
  .refine(atLeastOneField, {
    message: "At least one profile field is required"
  });

export const changePasswordBodySchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema
});

export const addressBodySchema = z.object({
  recipientName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  street: z.string().trim().min(2).max(255),
  district: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  isDefault: z.boolean().optional()
});

export const updateAddressBodySchema = addressBodySchema.partial().refine(atLeastOneField, {
  message: "At least one address field is required"
});

export const addressParamsSchema = z.object({
  id: z.string().uuid()
});

export const loyaltyLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
