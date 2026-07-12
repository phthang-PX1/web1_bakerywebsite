-- Quy tắc chọn cho nhóm option (chuyển từ hardcode client sang cấu hình DB/admin).
ALTER TABLE "option_groups" ADD COLUMN "max_select" INTEGER;
ALTER TABLE "option_groups" ADD COLUMN "free_quantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "option_groups" ADD COLUMN "surcharge_per_extra" DECIMAL(10,2) NOT NULL DEFAULT 0;
