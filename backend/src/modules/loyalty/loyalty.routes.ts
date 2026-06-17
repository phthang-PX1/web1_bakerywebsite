import { Router } from "express";
import { getLoyaltyStatus } from "./loyalty.controller";

const router = Router();

router.get("/", getLoyaltyStatus);

export default router;
