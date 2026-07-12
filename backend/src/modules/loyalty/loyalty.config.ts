import type { MembershipTier } from "@prisma/client";

export const POINT_VALUE = 10000;

export const TIER_MULTIPLIERS: Record<MembershipTier, number> = {
  member: 1,
  bronze: 1,
  silver: 1.2,
  gold: 1.5,
  diamond: 2
};

export const TIER_THRESHOLDS: Array<{
  tier: MembershipTier;
  minOrders: number;
  minRevenue: number;
}> = [
  { tier: "diamond", minOrders: 10, minRevenue: 5000000 },
  { tier: "gold", minOrders: 6, minRevenue: 2500000 },
  { tier: "silver", minOrders: 4, minRevenue: 1200000 },
  { tier: "bronze", minOrders: 2, minRevenue: 500000 }
];

/**
 * `coupon`: nếu có, khi khách đổi điểm sẽ sinh một Coupon THẬT (usageLimit=1) để
 * dùng được ngay ở checkout. Các reward là quà vật lý (gift/gift_box) hoặc freeship
 * (hệ thống hiện chưa tính phí ship) không có `coupon` — khách mang mã tới cửa hàng.
 */
export const REWARD_CATALOG = [
  {
    rewardId: "ship",
    name: "Mien phi giao hang",
    description: "Voucher freeship cho mot don hang bat ky.",
    cost: 150,
    voucherType: "free_shipping"
  },
  {
    rewardId: "save30",
    name: "Voucher 30.000 VND",
    description: "Giam truc tiep 30.000 VND cho don tu 200.000 VND.",
    cost: 300,
    voucherType: "fixed_discount",
    coupon: {
      discountType: "fixed",
      discountValue: 30000,
      minOrderValue: 200000,
      maxDiscountAmount: null
    }
  },
  {
    rewardId: "birthday",
    name: "Banh sinh nhat mini",
    description: "Tang 1 cupcake mini khi mua kem don hang trong thang.",
    cost: 400,
    voucherType: "gift"
  },
  {
    rewardId: "save50",
    name: "Voucher 50.000 VND",
    description: "Giam truc tiep 50.000 VND cho don tu 300.000 VND.",
    cost: 500,
    voucherType: "fixed_discount",
    coupon: {
      discountType: "fixed",
      discountValue: 50000,
      minOrderValue: 300000,
      maxDiscountAmount: null
    }
  },
  {
    rewardId: "percent15",
    name: "Giam 15% toan don",
    description: "Giam 15%, toi da 100.000 VND.",
    cost: 700,
    voucherType: "percent_discount",
    coupon: {
      discountType: "percent",
      discountValue: 15,
      minOrderValue: 0,
      maxDiscountAmount: 100000
    }
  },
  {
    rewardId: "vip",
    name: "Combo qua VIP",
    description: "Hop qua dac quyen va voucher 100.000 VND.",
    cost: 1200,
    voucherType: "gift_box"
  }
] as const;

/** Số ngày hiệu lực của coupon sinh ra từ đổi điểm. */
export const REDEEMED_COUPON_VALID_DAYS = 30;

export type RewardId = (typeof REWARD_CATALOG)[number]["rewardId"];
