import { Prisma, type MembershipTier } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import { toMoney } from "../../utils/money";
import { POINT_VALUE, REWARD_CATALOG, TIER_MULTIPLIERS, TIER_THRESHOLDS } from "./loyalty.config";
import type { CreditLoyaltyResult } from "./loyalty.types";

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

export const getRewardCatalog = () => REWARD_CATALOG;

export const redeemReward = async (
  userId: string | undefined,
  rewardId: string
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const reward = REWARD_CATALOG.find((item) => item.rewardId === rewardId);
  if (!reward) {
    throw new AppError(404, "Reward not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const redeemed = await tx.user.updateMany({
      where: {
        userId,
        loyaltyPoints: { gte: reward.cost }
      },
      data: {
        loyaltyPoints: { decrement: reward.cost }
      }
    });

    if (redeemed.count !== 1) {
      throw new AppError(400, "Not enough loyalty points");
    }

    await tx.loyaltyLog.create({
      data: {
        userId,
        pointsDelta: -reward.cost,
        reason: `Redeemed reward: ${reward.name}`
      }
    });

    const user = await tx.user.findUniqueOrThrow({
      where: { userId },
      select: { loyaltyPoints: true, membershipTier: true }
    });

    const voucherCode = `WB-${reward.rewardId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return {
      reward,
      voucher: {
        code: voucherCode,
        type: reward.voucherType,
        issuedAt: new Date().toISOString()
      },
      loyaltyPoints: user.loyaltyPoints,
      membershipTier: user.membershipTier
    };
  });

  return {
    message: "Reward redeemed successfully",
    ...result
  };
};

export const evaluateMembershipCycles = async () => {
  const users = await prisma.user.findMany({
    where: { role: "member" },
    select: { userId: true, membershipTier: true }
  });

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const orderStats = await prisma.order.groupBy({
    by: ["userId"],
    where: {
      userId: { not: null },
      orderStatus: "delivered",
      createdAt: {
        gte: sixMonthsAgo,
        lte: now
      }
    },
    _count: { orderId: true },
    _sum: { totalAmount: true }
  });
  const statsByUser = new Map(orderStats.map((stat) => [stat.userId, stat]));
  const cycleRows = users.map((user) => {
    const stats = statsByUser.get(user.userId);
    const totalOrders = stats?._count.orderId ?? 0;
    const totalRevenue = stats?._sum.totalAmount ?? new Prisma.Decimal(0);

    return {
      user,
      totalOrders,
      totalRevenue,
      newTier: resolveMembershipTierForCycle(totalOrders, totalRevenue)
    };
  });

  const updatedCount = cycleRows.filter(({ user, newTier }) => newTier !== user.membershipTier).length;

  await prisma.$transaction([
    prisma.membershipCycle.createMany({
      data: cycleRows.map(({ user, totalOrders, totalRevenue, newTier }) => ({
        userId: user.userId,
        cycleStart: sixMonthsAgo,
        cycleEnd: now,
        totalOrders,
        totalRevenue,
        tierResult: newTier
      }))
    }),
    ...cycleRows.map(({ user, newTier }) =>
      prisma.user.update({
        where: { userId: user.userId },
        data: { membershipTier: newTier }
      })
    )
  ]);

  return {
    evaluatedUsers: users.length,
    updatedTiers: updatedCount,
    cycleEnd: now.toISOString()
  };
};
