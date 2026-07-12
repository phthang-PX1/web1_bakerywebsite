import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import { toMoney } from "../../utils/money";
import { calculateCouponDiscount } from "./coupons.util";
import type {
  CouponInput,
  CouponValidationResult,
  UpdateCouponInput,
  ValidateCouponInput
} from "./coupons.types";

const formatCoupon = (coupon: {
  couponId: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: Prisma.Decimal;
  minOrderValue: Prisma.Decimal;
  maxDiscountAmount: Prisma.Decimal | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}) => ({
  ...coupon,
  discountValue: toMoney(coupon.discountValue),
  minOrderValue: toMoney(coupon.minOrderValue),
  maxDiscountAmount:
    coupon.maxDiscountAmount === null ? null : toMoney(coupon.maxDiscountAmount)
});

const invalidCouponResult = (
  input: ValidateCouponInput,
  reason: string
): CouponValidationResult => ({
  valid: false,
  code: input.code,
  discountAmount: 0,
  orderValue: toMoney(input.orderValue),
  finalAmount: toMoney(input.orderValue),
  reason
});

const mapCouponPersistenceError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(409, "Coupon code already exists");
  }

  throw error;
};


const assertDateRange = (startDate: Date, endDate: Date) => {
  if (startDate >= endDate) {
    throw new AppError(400, "startDate must be before endDate");
  }
};

const assertDiscountValue = (
  discountType: "percent" | "fixed",
  discountValue: Prisma.Decimal | number
) => {
  if (discountType === "percent" && toMoney(discountValue) > 100) {
    throw new AppError(400, "Percent discountValue cannot exceed 100");
  }
};

export const validateCoupon = async (
  input: ValidateCouponInput
): Promise<CouponValidationResult> => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: input.code }
  });

  if (!coupon) {
    return invalidCouponResult(input, "Coupon not found");
  }

  const now = new Date();

  if (!coupon.isActive) {
    return invalidCouponResult(input, "Coupon is inactive");
  }

  if (coupon.startDate > now || coupon.endDate < now) {
    return invalidCouponResult(input, "Coupon is not valid at this time");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return invalidCouponResult(input, "Coupon usage limit reached");
  }

  if (input.orderValue < toMoney(coupon.minOrderValue)) {
    return invalidCouponResult(input, "Order value does not meet coupon minimum");
  }

  const discountAmount = calculateCouponDiscount(coupon, input.orderValue);

  return {
    valid: true,
    code: coupon.code,
    couponId: coupon.couponId,
    discountType: coupon.discountType,
    discountValue: toMoney(coupon.discountValue),
    discountAmount,
    orderValue: toMoney(input.orderValue),
    finalAmount: toMoney(input.orderValue - discountAmount)
  };
};

export const createCoupon = async (input: CouponInput) => {
  assertDateRange(input.startDate, input.endDate);
  assertDiscountValue(input.discountType, input.discountValue);

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: input.code,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderValue: input.minOrderValue ?? 0,
        maxDiscountAmount: input.maxDiscountAmount,
        usageLimit: input.usageLimit,
        startDate: input.startDate,
        endDate: input.endDate,
        isActive: input.isActive ?? true
      }
    });

    return formatCoupon(coupon);
  } catch (error) {
    mapCouponPersistenceError(error);
  }
};

export const getCoupons = async () => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { startDate: "desc" }
  });

  return coupons.map(formatCoupon);
};

export const updateCoupon = async (
  couponId: string,
  input: UpdateCouponInput
) => {
  const coupon = await prisma.coupon.findUnique({
    where: { couponId }
  });

  if (!coupon) {
    throw new AppError(404, "Coupon not found");
  }

  const nextStartDate = input.startDate ?? coupon.startDate;
  const nextEndDate = input.endDate ?? coupon.endDate;
  assertDateRange(nextStartDate, nextEndDate);
  assertDiscountValue(
    input.discountType ?? coupon.discountType,
    input.discountValue ?? coupon.discountValue
  );

  try {
    const updatedCoupon = await prisma.coupon.update({
      where: { couponId },
      data: {
        ...(input.code !== undefined && { code: input.code }),
        ...(input.discountType !== undefined && { discountType: input.discountType }),
        ...(input.discountValue !== undefined && { discountValue: input.discountValue }),
        ...(input.minOrderValue !== undefined && { minOrderValue: input.minOrderValue }),
        ...(input.maxDiscountAmount !== undefined && {
          maxDiscountAmount: input.maxDiscountAmount
        }),
        ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }),
        ...(input.startDate !== undefined && { startDate: input.startDate }),
        ...(input.endDate !== undefined && { endDate: input.endDate }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      }
    });

    return formatCoupon(updatedCoupon);
  } catch (error) {
    mapCouponPersistenceError(error);
  }
};

export const toggleCouponStatus = async (couponId: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { couponId }
  });

  if (!coupon) {
    throw new AppError(404, "Coupon not found");
  }

  const updatedCoupon = await prisma.coupon.update({
    where: { couponId },
    data: { isActive: !coupon.isActive }
  });

  return formatCoupon(updatedCoupon);
};
