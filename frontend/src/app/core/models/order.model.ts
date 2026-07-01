export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'transfer' | 'cash';
export type FulfillmentType = 'delivery' | 'pickup';

export interface OrderItem {
  readonly orderItemId: string;
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly itemTotal: number;
  readonly options: { name: string; extraPrice: number }[];
}

export interface Order {
  readonly orderId: string;
  readonly userId: string | null;
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
  readonly order_id: string;
  readonly payment_qr_url: string | null;
  readonly transfer_content: string | null;
  readonly totalAmount?: number;
  readonly summary?: {
    readonly totalAmount: number;
    readonly recipientName: string;
  };
}
