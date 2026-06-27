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

export interface ValidateCouponRequest {
  code: string;
  orderTotal: number;
}

export interface ValidateCouponResponse {
  readonly couponId: string;
  readonly code: string;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly discountAmount: number;
}
