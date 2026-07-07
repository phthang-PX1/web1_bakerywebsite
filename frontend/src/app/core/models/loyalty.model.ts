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
  readonly rewards?: readonly LoyaltyReward[];
}

export interface LoyaltyReward {
  readonly rewardId: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly voucherType: string;
}

export interface RedeemRewardResponse {
  readonly message: string;
  readonly reward: LoyaltyReward;
  readonly voucher: {
    readonly code: string;
    readonly type: string;
    readonly issuedAt: string;
  };
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
