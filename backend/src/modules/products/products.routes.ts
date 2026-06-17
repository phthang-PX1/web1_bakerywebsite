import { Router } from "express";
import { getProductsStatus } from "./products.controller";

const router = Router();

router.get("/", getProductsStatus);

export default router;
