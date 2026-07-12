import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(255)
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

const optionalBooleanSchema = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const imageUrlsSchema = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
}, z.array(z.string().trim().url().max(500)).optional());

const priceSchema = z.coerce.number().positive().max(99999999.99);
const atLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);

export const productSlugParamsSchema = z.object({
  slug: slugSchema
});

export const productIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const productImageParamsSchema = z.object({
  id: z.string().uuid(),
  imageId: z.string().uuid()
});

export const productListQuerySchema = z
  .object({
    category: z.preprocess((value) => {
      if (value === "" || value === undefined) return undefined;
      if (Array.isArray(value)) return value;
      return [value];
    }, z.array(slugSchema).optional()),
    search: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().trim().min(1).max(100).optional()
    ),
    min_price: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().min(0).optional()
    ),
    max_price: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().min(0).optional()
    ),
    sort: z.enum(["newest", "price_asc", "price_desc", "rating_desc", "best_sellers"]).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    // Cho phép tới 500 để admin có thể tải toàn bộ sản phẩm (vd trang danh mục đếm số SP).
    limit: z.coerce.number().int().min(1).max(500).default(20)
  })
  .refine(
    (value) =>
      value.min_price === undefined ||
      value.max_price === undefined ||
      value.min_price <= value.max_price,
    {
      message: "min_price must be less than or equal to max_price"
    }
  )
  .transform((value) => ({
    categories: value.category,
    search: value.search,
    minPrice: value.min_price,
    maxPrice: value.max_price,
    sort: value.sort,
    page: value.page,
    limit: value.limit
  }));

export const productReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const createProductBodySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(255),
  slug: optionalSlugSchema,
  description: optionalNullableTextSchema(3000),
  basePrice: priceSchema,
  thumbnailUrl: optionalNullableUrlSchema,
  isCustomizable: optionalBooleanSchema,
  imageUrls: imageUrlsSchema
});

export const updateProductBodySchema = createProductBodySchema
  .omit({ imageUrls: true })
  .extend({
    isActive: optionalBooleanSchema
  })
  .partial()
  .refine(atLeastOneField, {
    message: "At least one product field is required"
  });
