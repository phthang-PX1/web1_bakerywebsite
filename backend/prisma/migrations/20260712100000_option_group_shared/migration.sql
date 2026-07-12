-- Cho phép thành phần dùng chung: OptionGroup.product_id có thể NULL.
-- DropForeignKey (để tạo lại với productId nullable + onDelete Cascade giữ nguyên)
ALTER TABLE "option_groups" DROP CONSTRAINT "option_groups_product_id_fkey";

-- AlterColumn: product_id nullable
ALTER TABLE "option_groups" ALTER COLUMN "product_id" DROP NOT NULL;

-- AddForeignKey (nullable)
ALTER TABLE "option_groups" ADD CONSTRAINT "option_groups_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;
