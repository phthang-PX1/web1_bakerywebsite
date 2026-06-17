import { z } from "zod";

const uuidSchema = z.string().uuid();

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.string().trim().min(1).max(max).optional()
  );

export const createReviewBodySchema = z
  .object({
    order_item_id: uuidSchema,
    rating: z.coerce.number().int().min(1).max(5),
    comment: optionalTrimmedString(1000)
  })
  .transform((value) => ({
    orderItemId: value.order_item_id,
    rating: value.rating,
    comment: value.comment
  }));

export const reviewIdParamsSchema = z.object({
  id: uuidSchema
});

export const adminReviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
