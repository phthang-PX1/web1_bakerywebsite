import { z } from "zod";

export const creditLoyaltyBodySchema = z
  .object({
    order_id: z.string().uuid()
  })
  .transform((value) => ({
    orderId: value.order_id
  }));
