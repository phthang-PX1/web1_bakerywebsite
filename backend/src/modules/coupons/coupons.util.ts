import { Prisma } from "@prisma/client";
import { toMoney } from "../../utils/money";

type CouponDiscountConfig = {
  discountType: "percent" | "fixed";
  discountValue: Prisma.Decimal;
  maxDiscountAmount: Prisma.Decimal | null;
};

/**
 * Compute the discount a coupon applies to an order value.
 * Percent coupons discount a fraction of the order; fixed coupons discount a
 * flat amount. The result is capped at maxDiscountAmount (when set) and can
 * never exceed the order value itself.
 */
export const calculateCouponDiscount = (
  coupon: CouponDiscountConfig,
  orderValue: number
): number => {
  const discountValue = toMoney(coupon.discountValue);
  const rawDiscount =
    coupon.discountType === "percent"
      ? orderValue * (discountValue / 100)
      : discountValue;
  const cappedDiscount =
    coupon.maxDiscountAmount === null
      ? rawDiscount
      : Math.min(rawDiscount, toMoney(coupon.maxDiscountAmount));

  return toMoney(Math.min(cappedDiscount, orderValue));
};
