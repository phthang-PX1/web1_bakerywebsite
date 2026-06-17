import { Router } from "express";
import analyticsRoutes from "../modules/analytics/analytics.routes";
import authRoutes from "../modules/auth/auth.routes";
import cartRoutes from "../modules/cart/cart.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import couponsRoutes from "../modules/coupons/coupons.routes";
import loyaltyRoutes from "../modules/loyalty/loyalty.routes";
import optionsRoutes from "../modules/options/options.routes";
import ordersRoutes from "../modules/orders/orders.routes";
import productsRoutes from "../modules/products/products.routes";
import reviewsRoutes from "../modules/reviews/reviews.routes";
import usersRoutes from "../modules/users/users.routes";

const router = Router();

router.use("/analytics", analyticsRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/categories", categoriesRoutes);
router.use("/coupons", couponsRoutes);
router.use("/loyalty", loyaltyRoutes);
router.use("/options", optionsRoutes);
router.use("/orders", ordersRoutes);
router.use("/products", productsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/users", usersRoutes);

export default router;
