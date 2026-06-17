import { Router } from "express";
import { getReviewsStatus } from "./reviews.controller";

const router = Router();

router.get("/", getReviewsStatus);

export default router;
