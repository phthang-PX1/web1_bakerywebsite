import { Router } from "express";
import { getAnalyticsStatus } from "./analytics.controller";

const router = Router();

router.get("/", getAnalyticsStatus);

export default router;
