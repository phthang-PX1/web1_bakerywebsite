import { Router } from "express";
import analyticsRoutes, { adminAnalyticsRoutes } from "../modules/analytics/analytics.routes";
import authRoutes from "../modules/auth/auth.routes";
import bannersRoutes, { adminBannersRoutes } from "../modules/banners/banners.routes";
import cartRoutes from "../modules/cart/cart.routes";
import categoriesRoutes, { adminCategoriesRoutes } from "../modules/categories/categories.routes";
import couponsRoutes, { adminCouponsRoutes } from "../modules/coupons/coupons.routes";
import loyaltyRoutes, { adminLoyaltyRoutes } from "../modules/loyalty/loyalty.routes";
import productOptionsRoutes, {
  adminOptionsRouter,
  adminProductOptionsRouter
} from "../modules/options/options.routes";
import ordersRoutes, {
  adminOrdersRoutes,
  paymentWebhookRoutes
} from "../modules/orders/orders.routes";
import productsRoutes, { adminProductsRoutes } from "../modules/products/products.routes";
import reviewsRoutes, { adminReviewsRoutes } from "../modules/reviews/reviews.routes";
import usersRoutes from "../modules/users/users.routes";

const router = Router();

router.use("/analytics", analyticsRoutes);
router.use("/admin/analytics", adminAnalyticsRoutes);
router.use("/auth", authRoutes);
router.use("/banners", bannersRoutes);
router.use("/admin/banners", adminBannersRoutes);
router.use("/cart", cartRoutes);
router.use("/categories", categoriesRoutes);
router.use("/admin/categories", adminCategoriesRoutes);
router.use("/coupons", couponsRoutes);
router.use("/admin/coupons", adminCouponsRoutes);
router.use("/internal/loyalty", loyaltyRoutes);
router.use("/admin/loyalty", adminLoyaltyRoutes);
router.use("/orders", ordersRoutes);
router.use("/webhooks", paymentWebhookRoutes);
router.use("/admin/orders", adminOrdersRoutes);
router.use("/admin/reviews", adminReviewsRoutes);
router.use("/products", productOptionsRoutes);
router.use("/products", productsRoutes);
router.use("/admin", adminOptionsRouter);
router.use("/admin/products", adminProductOptionsRouter);
router.use("/admin/products", adminProductsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/users", usersRoutes);

export default router;
