import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers, and hyphens");

const optionalSlugSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  slugSchema.optional()
);

const optionalNullableTextSchema = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable().optional()
  );

const optionalNullableUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().url().max(500).nullable().optional()
);

const atLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);

export const categorySlugParamsSchema = z.object({
  slug: slugSchema
});

export const categoryIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: optionalSlugSchema,
  description: optionalNullableTextSchema(1000),
  imageUrl: optionalNullableUrlSchema
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial().refine(atLeastOneField, {
  message: "At least one category field is required"
});
