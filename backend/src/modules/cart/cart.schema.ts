import { z } from "zod";

const quantitySchema = z.coerce.number().int().min(1).max(99);

const optionItemIdsSchema = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return value;
}, z.array(z.string().uuid()).default([]));

export const cartItemParamsSchema = z.object({
  cartItemId: z.string().uuid()
});

export const addCartItemBodySchema = z
  .object({
    product_id: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    quantity: quantitySchema,
    option_item_ids: optionItemIdsSchema.optional(),
    optionItemIds: optionItemIdsSchema.optional(),
    force_new: z.coerce.boolean().optional(),
    forceNew: z.coerce.boolean().optional()
  })
  .transform((value) => ({
    productId: value.productId ?? value.product_id,
    quantity: value.quantity,
    optionItemIds: value.optionItemIds ?? value.option_item_ids ?? [],
    forceNew: value.forceNew ?? value.force_new ?? false
  }))
  .refine((value) => value.productId !== undefined, {
    message: "product_id is required",
    path: ["product_id"]
  });

export const updateCartItemBodySchema = z.object({
  quantity: quantitySchema
});
