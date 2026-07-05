import type { MembershipTier } from './user.model';

export type PointTransactionType = 'earn' | 'redeem' | 'expire' | 'bonus';

export interface LoyaltyLog {
  readonly logId: string;
  readonly points: number;
  readonly type: PointTransactionType;
  readonly description: string;
  readonly createdAt: string;
}

/** Shape of GET /users/me/loyalty (see backend users.service getLoyaltySummary). */
export interface LoyaltyInfo {
  readonly loyaltyPoints: number;
  readonly membershipTier: MembershipTier;
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
