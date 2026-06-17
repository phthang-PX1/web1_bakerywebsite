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

export const createOptionGroupBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  isRequired: optionalBooleanSchema,
  isMultiple: optionalBooleanSchema,
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
