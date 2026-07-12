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
    fullName: z.string().trim().min(2).max(100).optional()
  })
  .refine(atLeastOneField, {
    message: "At least one profile field is required"
  });

export const changeEmailBodySchema = z.object({
  email: z.string().trim().email().max(255)
});

export const changePhoneBodySchema = z.object({
  phone: phoneSchema
});

export const verifyPhoneChangeBodySchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be exactly 6 digits")
});

export const confirmEmailChangeBodySchema = z.object({
  token: z.string().trim().min(1)
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

export const redeemRewardBodySchema = z.object({
  rewardId: z.string().trim().min(1).max(50)
});

export const adminCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true"))
});

export const adminCustomerParamsSchema = z.object({
  id: z.string().uuid()
});
