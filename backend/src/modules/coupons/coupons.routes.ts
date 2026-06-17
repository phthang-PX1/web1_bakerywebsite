import { Router } from "express";
import { getCouponsStatus } from "./coupons.controller";

const router = Router();

router.get("/", getCouponsStatus);

export default router;
