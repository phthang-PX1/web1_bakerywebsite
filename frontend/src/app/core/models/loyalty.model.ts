import type { MembershipTier } from './user.model';

export type PointTransactionType = 'earn' | 'redeem' | 'expire' | 'bonus';

// Khớp chính xác row Prisma LoyaltyLog mà backend trả về (getLoyaltyLogs):
// { logId, userId, orderId, pointsDelta, reason, createdAt }.
export interface LoyaltyLog {
  readonly logId: string;
  readonly userId: string;
  readonly orderId: string | null;
  readonly pointsDelta: number;
  readonly reason: string;
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
    /** true = mã nhập được ngay ở checkout (đã là coupon thật); false = quà nhận tại cửa hàng. */
    readonly redeemable: boolean;
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
