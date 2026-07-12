import { z } from "zod";

const optionalBooleanSchema = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const optionalNullableUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().url().max(500).nullable().optional()
);

const optionalSortOrderSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).max(9999).optional()
);

const atLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);

export const productOptionsParamsSchema = z.object({
  id: z.string().uuid()
});

export const optionGroupParamsSchema = z.object({
  id: z.string().uuid()
});

export const optionItemParamsSchema = z.object({
  id: z.string().uuid()
});

const optionalIntSchema = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().min(min).max(max).optional()
  );
const optionalNullableIntSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value === null ? null : value),
  z.coerce.number().int().min(1).max(99).nullable().optional()
);

export const createOptionGroupBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  isRequired: optionalBooleanSchema,
  isMultiple: optionalBooleanSchema,
  maxSelect: optionalNullableIntSchema,
  freeQuantity: optionalIntSchema(0, 99),
  surchargePerExtra: z.coerce.number().min(0).max(99999999.99).optional(),
  sortOrder: optionalSortOrderSchema
});

export const updateOptionGroupBodySchema = createOptionGroupBodySchema
  .partial()
  .refine(atLeastOneField, {
    message: "At least one option group field is required"
  });

export const createOptionItemBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  extraPrice: z.coerce.number().min(0).max(99999999.99).optional(),
  imageUrl: optionalNullableUrlSchema,
  sortOrder: optionalSortOrderSchema
});

export const updateOptionItemBodySchema = createOptionItemBodySchema
  .partial();
