import { Prisma, type MembershipTier } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import type { CreditLoyaltyResult } from "./loyalty.types";

const POINT_VALUE = 10000;
const TIER_MULTIPLIERS: Record<MembershipTier, number> = {
  member: 1,
  bronze: 1,
  silver: 1.2,
  gold: 1.5,
  diamond: 2
};
const TIER_THRESHOLDS: Array<{
  tier: MembershipTier;
  minOrders: number;
  minRevenue: number;
}> = [
  { tier: "diamond", minOrders: 10, minRevenue: 5000000 },
  { tier: "gold", minOrders: 6, minRevenue: 2500000 },
  { tier: "silver", minOrders: 4, minRevenue: 1200000 },
  { tier: "bronze", minOrders: 2, minRevenue: 500000 }
];

const toMoney = (value: Prisma.Decimal | number) =>
  Number(Number(value).toFixed(2));

export const calculateLoyaltyPoints = (totalAmount: Prisma.Decimal | number) =>
  Math.floor(toMoney(totalAmount) / POINT_VALUE);

export const calculateTierAdjustedLoyaltyPoints = (
  totalAmount: Prisma.Decimal | number,
  membershipTier: MembershipTier
) => Math.floor(calculateLoyaltyPoints(totalAmount) * TIER_MULTIPLIERS[membershipTier]);

export const resolveMembershipTierForCycle = (
  totalOrders: number,
  totalRevenue: Prisma.Decimal | number
): MembershipTier => {
  const revenue = toMoney(totalRevenue);
  const matchedTier = TIER_THRESHOLDS.find(
    (rule) => totalOrders >= rule.minOrders && revenue >= rule.minRevenue
  );

  if (matchedTier) return matchedTier.tier;
  return "member";
};

export const creditDeliveredOrderLoyaltyInTransaction = async (
  tx: Prisma.TransactionClient,
  orderId: string
): Promise<CreditLoyaltyResult> => {
  const order = await tx.order.findUnique({
    where: { orderId },
    select: {
      orderId: true,
      userId: true,
      totalAmount: true,
      orderStatus: true,
      loyaltyPointsEarned: true,
      user: {
        select: {
          loyaltyPoints: true,
          membershipTier: true
        }
      }
    }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (!order.userId || !order.user) {
    throw new AppError(400, "Order is not linked to a user");
  }

  if (order.orderStatus !== "delivered") {
    throw new AppError(400, "Loyalty points can only be credited for delivered orders");
  }

  if (order.loyaltyPointsEarned > 0) {
    return {
      orderId: order.orderId,
      userId: order.userId,
      pointsEarned: order.loyaltyPointsEarned,
      totalPoints: order.user.loyaltyPoints,
      membershipTier: order.user.membershipTier,
      alreadyCredited: true
    };
  }

  const points = calculateTierAdjustedLoyaltyPoints(
    order.totalAmount,
    order.user.membershipTier
  );

  if (points <= 0) {
    return {
      orderId: order.orderId,
      userId: order.userId,
      pointsEarned: 0,
      totalPoints: order.user.loyaltyPoints,
      membershipTier: order.user.membershipTier,
      alreadyCredited: false
    };
  }

  const creditedOrder = await tx.order.updateMany({
    where: {
      orderId: order.orderId,
      loyaltyPointsEarned: 0
    },
    data: { loyaltyPointsEarned: points }
  });

  if (creditedOrder.count === 0) {
    const latestOrder = await tx.order.findUniqueOrThrow({
      where: { orderId: order.orderId },
      select: { loyaltyPointsEarned: true }
    });
    const latestUser = await tx.user.findUniqueOrThrow({
      where: { userId: order.userId },
      select: {
        loyaltyPoints: true,
        membershipTier: true
      }
    });

    return {
      orderId: order.orderId,
      userId: order.userId,
      pointsEarned: latestOrder.loyaltyPointsEarned,
      totalPoints: latestUser.loyaltyPoints,
      membershipTier: latestUser.membershipTier,
      alreadyCredited: true
    };
  }

  await tx.loyaltyLog.create({
    data: {
      userId: order.userId,
      orderId: order.orderId,
      pointsDelta: points,
      reason: "Order delivered"
    }
  });

  const user = await tx.user.update({
    where: { userId: order.userId },
    data: {
      loyaltyPoints: { increment: points }
    },
    select: {
      loyaltyPoints: true
    }
  });

  return {
    orderId: order.orderId,
    userId: order.userId,
    pointsEarned: points,
    totalPoints: user.loyaltyPoints,
    membershipTier: order.user.membershipTier,
    alreadyCredited: false
  };
};

export const creditDeliveredOrderLoyalty = async (orderId: string) =>
  prisma.$transaction((tx) =>
    creditDeliveredOrderLoyaltyInTransaction(tx, orderId)
  );

export const revokeOrderLoyaltyInTransaction = async (
  tx: Prisma.TransactionClient,
  orderId: string
) => {
  const order = await tx.order.findUnique({
    where: { orderId },
    select: {
      orderId: true,
      userId: true,
      loyaltyPointsEarned: true,
      user: {
        select: { userId: true }
      }
    }
  });

  if (!order?.userId || !order.user || order.loyaltyPointsEarned <= 0) {
    return;
  }

  const resetOrder = await tx.order.updateMany({
    where: {
      orderId,
      loyaltyPointsEarned: { gt: 0 }
    },
    data: { loyaltyPointsEarned: 0 }
  });

  if (resetOrder.count === 0) return;

  await tx.user.update({
    where: { userId: order.userId },
    data: {
      loyaltyPoints: { decrement: order.loyaltyPointsEarned }
    }
  });

  await tx.loyaltyLog.create({
    data: {
      userId: order.userId,
      orderId: order.orderId,
      pointsDelta: -order.loyaltyPointsEarned,
      reason: "Order cancelled points reversal"
    }
  });
};
