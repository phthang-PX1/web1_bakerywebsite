import { Router } from "express";
import { getOrdersStatus } from "./orders.controller";

const router = Router();

router.get("/", getOrdersStatus);

export default router;
