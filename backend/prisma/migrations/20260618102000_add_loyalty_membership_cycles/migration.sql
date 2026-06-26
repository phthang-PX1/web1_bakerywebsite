ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'member';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'diamond';

CREATE TYPE "VoucherTier" AS ENUM ('bronze', 'silver', 'gold', 'diamond');

CREATE TABLE "membership_cycles" (
    "cycle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "cycle_start" DATE NOT NULL,
    "cycle_end" DATE NOT NULL,
    "total_orders" INTEGER NOT NULL,
    "total_revenue" DECIMAL(10,2) NOT NULL,
    "tier_result" "MembershipTier" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_cycles_pkey" PRIMARY KEY ("cycle_id")
);

CREATE TABLE "vouchers_inventory" (
    "voucher_template_id" UUID NOT NULL,
    "tier" "VoucherTier" NOT NULL,
    "coupon_id" UUID NOT NULL,
    "quantity_per_month" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vouchers_inventory_pkey" PRIMARY KEY ("voucher_template_id")
);

CREATE INDEX "membership_cycles_user_id_idx" ON "membership_cycles"("user_id");
CREATE INDEX "membership_cycles_cycle_start_cycle_end_idx" ON "membership_cycles"("cycle_start", "cycle_end");
CREATE INDEX "vouchers_inventory_tier_idx" ON "vouchers_inventory"("tier");
CREATE INDEX "vouchers_inventory_coupon_id_idx" ON "vouchers_inventory"("coupon_id");

ALTER TABLE "membership_cycles" ADD CONSTRAINT "membership_cycles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vouchers_inventory" ADD CONSTRAINT "vouchers_inventory_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE CASCADE ON UPDATE CASCADE;
