import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .transform((value) => value.toUpperCase());

const moneySchema = z.coerce.number().min(0).max(99999999.99);
const positiveMoneySchema = z.coerce.number().positive().max(99999999.99);
const optionalNullableMoneySchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  moneySchema.nullable().optional()
);
const optionalNullableUsageLimitSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().int().positive().nullable().optional()
);
const optionalBooleanSchema = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());
const atLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);

const validateDateRange = (value: { startDate?: Date; endDate?: Date }) =>
  !value.startDate || !value.endDate || value.startDate < value.endDate;

export const couponIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const validateCouponBodySchema = z
  .object({
    code: codeSchema,
    order_value: moneySchema
  })
  .transform((value) => ({
    code: value.code,
    orderValue: value.order_value
  }));

const couponBodyBaseSchema = z.object({
  code: codeSchema,
  discountType: z.enum(["percent", "fixed"]),
  discountValue: positiveMoneySchema,
  minOrderValue: moneySchema.default(0),
  maxDiscountAmount: optionalNullableMoneySchema,
  usageLimit: optionalNullableUsageLimitSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: optionalBooleanSchema
});

export const createCouponBodySchema = couponBodyBaseSchema
  .refine(
    (value) => value.discountType !== "percent" || value.discountValue <= 100,
    {
      message: "Percent discountValue cannot exceed 100"
    }
  )
  .refine(validateDateRange, {
    message: "startDate must be before endDate"
  });

export const updateCouponBodySchema = couponBodyBaseSchema
  .partial()
  .refine(atLeastOneField, {
    message: "At least one coupon field is required"
  })
  .refine(
    (value) =>
      value.discountType !== "percent" ||
      value.discountValue === undefined ||
      value.discountValue <= 100,
    {
      message: "Percent discountValue cannot exceed 100"
    }
  )
  .refine(validateDateRange, {
    message: "startDate must be before endDate"
  });
