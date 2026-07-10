export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  readonly couponId: string;
  readonly code: string;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly minOrderValue: number;
  readonly maxDiscountAmount: number | null;
  readonly isActive: boolean;
  /** Legacy field — maps to endDate in backend */
  readonly expiresAt: string | null;
  /** Admin-only fields from backend */
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly usageLimit?: number | null;
  readonly usageCount?: number;

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
