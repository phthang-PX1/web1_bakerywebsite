import { Router } from "express";
import { getCartStatus } from "./cart.controller";

const router = Router();

router.get("/", getCartStatus);

export default router;
