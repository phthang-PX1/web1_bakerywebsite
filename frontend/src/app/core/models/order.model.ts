export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'transfer' | 'cash';
export type FulfillmentType = 'delivery' | 'pickup';

export interface OrderItemReview {
  readonly reviewId: string;
  readonly rating: number;
  readonly comment: string | null;
}

export interface OrderItem {
  readonly orderItemId: string;
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly itemTotal: number;
  readonly options: { name: string; extraPrice: number }[];
  /** Present on order-detail responses: the existing review for this line, or null. */
  readonly review?: OrderItemReview | null;
}

/** Sub-object present only on Admin order list/detail responses */
export interface OrderUser {
  readonly userId: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly phone: string | null;
}

export interface Order {
  readonly orderId: string;
  readonly userId: string | null;
  readonly buyerName: string | null;
  readonly buyerPhone: string | null;
  /** Available in admin responses: the linked member account, if any */
  readonly user?: OrderUser | null;
  readonly orderStatus: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  readonly paymentMethod: PaymentMethod;
  readonly fulfillmentType: FulfillmentType;
  readonly recipientName: string;
  readonly phone: string;
  readonly deliveryAddress: string | null;
  readonly deliveryDate: string;
  readonly deliveryTimeSlot: string;
  readonly subtotal: number;
  readonly shippingFee: number;
  readonly discountAmount: number;
  readonly totalAmount: number;
  readonly note: string | null;
  readonly cardType: string;
  readonly cardMessage: string | null;
  readonly paymentQrUrl: string | null;
  readonly transferContent: string | null;
  readonly items: OrderItem[];
  readonly createdAt: string;
}

/** Snake_case body as required by POST /api/orders schema */
export interface CreateOrderRequest {
  buyer_name: string;
  buyer_phone: string;
  recipient_name: string;
  email?: string;
  phone: string;
  fulfillment_type: FulfillmentType;
  delivery_address?: string;
  delivery_date: string;        // format: YYYY-MM-DD
  delivery_time_slot: string;
  payment_method: PaymentMethod;
  coupon_code?: string;
  note?: string;
  card_type?: 'none' | 'on_cake' | 'small_card' | 'premium_card';
  card_message?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface CreateOrderResponse {
  readonly orderId: string;
  readonly paymentQrUrl: string | null;
  readonly transferContent: string | null;
  readonly trackingToken: string;
  readonly totalAmount?: number;
  readonly summary?: {
    readonly totalAmount: number;
    readonly recipientName: string;
  };
}
