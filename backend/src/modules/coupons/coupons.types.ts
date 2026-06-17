import type { DiscountType } from "@prisma/client";

export type ValidateCouponInput = {
  code: string;
  orderValue: number;
};

export type CouponInput = {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
};

export type UpdateCouponInput = Partial<CouponInput>;

export type CouponValidationResult = {
  valid: boolean;
  code: string;
  couponId?: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount: number;
  orderValue: number;
  finalAmount: number;
  reason?: string;
};
