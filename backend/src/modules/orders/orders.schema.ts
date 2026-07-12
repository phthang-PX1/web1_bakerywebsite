import { z } from "zod";

const uuidSchema = z.string().uuid();
const phoneSchema = z.string().trim().min(8).max(20);
const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (!value || value === "" ? undefined : value));

const optionalBuyerNameSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (!value || value === "" ? undefined : value))
  .pipe(z.string().min(2).max(100).optional());

const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (!value || value === "" ? undefined : value))
  .pipe(phoneSchema.optional());

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (!value || value === "" ? undefined : value))
  .pipe(z.string().email().optional());

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "ready",
  "delivered",
  "cancelled"
]);
const paymentStatusSchema = z.enum(["pending", "paid", "failed"]);

export const orderIdParamsSchema = z.object({
  id: uuidSchema
});

export const orderTrackingQuerySchema = z.object({
  token: z.string().min(1)
});

export const claimOrderBodySchema = z.object({
  token: z.string().min(1)
});

export const createOrderBodySchema = z
  .object({
    buyer_name: optionalBuyerNameSchema,
    buyer_phone: optionalPhoneSchema,
    recipient_name: z.string().trim().min(2).max(100),
    email: optionalEmailSchema,
    phone: phoneSchema,
    fulfillment_type: z.enum(["delivery", "pickup"]),
    delivery_address: optionalTrimmedString(500),
    delivery_date: z.coerce.date(),
    delivery_time_slot: z.string().trim().min(1).max(50),
    coupon_code: optionalTrimmedString(50).transform((value) =>
      value?.toUpperCase()
    ),
    payment_method: z
      .enum(["transfer", "cash", "cod"])
      .default("transfer")
      .transform((val) => (val === "cod" ? "cash" : val)),
    note: optionalTrimmedString(1000),
    card_type: z.enum(["none", "on_cake", "small_card", "premium_card"]).default("none"),
    card_message: optionalTrimmedString(300),
    cart_item_ids: z.array(uuidSchema).optional(),
    cartItemIds: z.array(uuidSchema).optional()
  })
  .refine(
    (value) =>
      value.fulfillment_type !== "delivery" ||
      Boolean(value.delivery_address?.trim()),
    {
      message: "delivery_address is required for delivery orders"
    }
  )
  .transform((value) => ({
    buyerName: value.buyer_name ?? value.recipient_name,
    buyerPhone: value.buyer_phone ?? value.phone,
    recipientName: value.recipient_name,
    email: value.email?.toLowerCase(),
    phone: value.phone,
    fulfillmentType: value.fulfillment_type,
    deliveryAddress: value.delivery_address,
    deliveryDate: value.delivery_date,
    deliveryTimeSlot: value.delivery_time_slot,
    couponCode: value.coupon_code,
    paymentMethod: value.payment_method,
    note: value.note,
    cardType: value.card_type,
    cardMessage: value.card_message,
    cartItemIds: value.cartItemIds ?? value.cart_item_ids
  }));

export const paymentWebhookBodySchema = z
  .object({
    order_id: uuidSchema,
    amount: z.coerce.number().positive().max(99999999.99),
    // Nội dung chuyển khoản (vd "DH<orderId>"). Optional để tương thích ngược,
    // nhưng nếu có sẽ được đối chiếu với mã đơn trong service.
    transfer_content: optionalTrimmedString(100)
  })
  .transform((value) => ({
    orderId: value.order_id,
    amount: value.amount,
    transferContent: value.transfer_content
  }));

export const orderListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: orderStatusSchema.optional(),
    payment_status: paymentStatusSchema.optional(),
    date_from: z.coerce.date().optional(),
    date_to: z.coerce.date().optional(),
    search: optionalTrimmedString(100)
  })
  .transform((value) => ({
    page: value.page,
    limit: value.limit,
    status: value.status,
    paymentStatus: value.payment_status,
    dateFrom: value.date_from,
    dateTo: value.date_to,
    search: value.search
  }));

export const updateOrderStatusBodySchema = z
  .object({
    status: orderStatusSchema,
    cancelReason: z.string().optional()
  })
  .transform((value) => ({
    status: value.status,
    cancelReason: value.cancelReason
  }));
