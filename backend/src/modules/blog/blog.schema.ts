import { z } from "zod";

// Trong multipart/form-data, mảng thường gửi dưới dạng chuỗi JSON. Preprocess để
// chấp nhận cả mảng thật lẫn chuỗi JSON.
const stringArraySchema = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return value;
}, z.array(z.string().trim().min(1)));

const optionalBooleanSchema = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return value;
}, z.boolean().optional());

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ")
  .optional();

export const blogIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const blogSlugParamsSchema = z.object({
  slug: z.string().trim().min(1)
});

export const blogListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    is_active: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "true"))
  })
  .transform((value) => ({
    page: value.page,
    limit: value.limit,
    search: value.search,
    isActive: value.is_active
  }));

export const createBlogPostBodySchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(255),
  excerpt: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(100),
  readingTime: z.string().trim().max(50).optional(),
  content: stringArraySchema,
  // Cho phép truyền URL ảnh sẵn (nếu không upload file mới).
  coverImageUrl: z.string().trim().max(500).optional(),
  galleryImageUrls: stringArraySchema.optional(),
  isActive: optionalBooleanSchema
});

export const updateBlogPostBodySchema = createBlogPostBodySchema.partial();
