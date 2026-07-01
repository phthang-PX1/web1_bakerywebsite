import type { MembershipTier } from './user.model';

export type PointTransactionType = 'earn' | 'redeem' | 'expire' | 'bonus';

export interface LoyaltyLog {
  readonly logId: string;
  readonly points: number;
  readonly type: PointTransactionType;
  readonly description: string;
  readonly createdAt: string;
}

export interface LoyaltyInfo {
  readonly currentPoints: number;
  readonly currentTier: MembershipTier;
  readonly nextTier: MembershipTier | null;
  readonly pointsToNextTier: number | null;
}

export interface TierBenefit {
  readonly tier: MembershipTier;
  readonly label: string;
  readonly pointMultiplier: number;
  readonly discountPercent: number;
  readonly freeShipping: boolean;
  readonly minOrders: number;
  readonly minRevenue: number;
}
