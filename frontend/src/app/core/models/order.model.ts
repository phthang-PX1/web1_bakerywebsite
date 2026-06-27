export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'transfer' | 'cod';
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
  readonly paymentQrUrl: string | null;
  readonly transferContent: string | null;
  readonly items: OrderItem[];
  readonly createdAt: string;
}

export interface CreateOrderRequest {
  recipientName: string;
  email?: string;
  phone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  note?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
