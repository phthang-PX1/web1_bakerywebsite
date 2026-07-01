export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  readonly couponId: string;
  readonly code: string;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly minOrderValue: number;
  readonly maxDiscountAmount: number | null;
  readonly isActive: boolean;
  readonly expiresAt: string | null;
}

/** Snake_case body as required by POST /api/coupons/validate schema */
export interface ValidateCouponRequest {
  code: string;
  order_value: number;
}

export interface ValidateCouponResponse {
  readonly valid: boolean;
  readonly code: string;
  readonly couponId?: string;
  readonly discountType?: DiscountType;
  readonly discountValue?: number;
  readonly discountAmount: number;
  readonly orderValue: number;
  readonly finalAmount: number;
  readonly reason?: string;
}
