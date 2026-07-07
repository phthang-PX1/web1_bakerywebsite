import type {
  FulfillmentType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus
} from "@prisma/client";

export type OrderCreateInput = {
  buyerName: string;
  buyerPhone: string;
  recipientName: string;
  email?: string;
  phone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  deliveryDate: Date;
  deliveryTimeSlot: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  note?: string;
  cardType: string;
  cardMessage?: string;
};

export type PaymentWebhookInput = {
  orderId: string;
  amount: number;
};

export type OrderListQuery = {
  page: number;
  limit: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
};

export type OrderTrackingQuery = {
  token: string;
};

export type UpdateOrderStatusInput = {
  status: OrderStatus;
};

export type OrderIdentity = {
  userId?: string;
  sessionId?: string;
};
