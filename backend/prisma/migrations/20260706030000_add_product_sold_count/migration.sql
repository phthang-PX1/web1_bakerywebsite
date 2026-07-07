ALTER TABLE "products" ADD COLUMN "sold_count" INTEGER NOT NULL DEFAULT 0;
UPDATE "products" AS p
SET "sold_count" = COALESCE(s."sold_count", 0)
FROM (
  SELECT oi."product_id", SUM(oi."quantity")::INTEGER AS "sold_count"
  FROM "order_items" oi
  INNER JOIN "orders" o ON o."order_id" = oi."order_id"
  WHERE o."order_status" = 'delivered'
  GROUP BY oi."product_id"
) AS s
WHERE p."product_id" = s."product_id";
CREATE INDEX "products_sold_count_idx" ON "products"("sold_count");
