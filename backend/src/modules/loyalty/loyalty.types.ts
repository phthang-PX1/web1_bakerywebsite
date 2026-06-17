import type { MembershipTier } from "@prisma/client";

export type CreditLoyaltyInput = {
  orderId: string;
};

export type CreditLoyaltyResult = {
  orderId: string;
  userId: string;
  pointsEarned: number;
  totalPoints: number;
  membershipTier: MembershipTier;
  alreadyCredited: boolean;
};
