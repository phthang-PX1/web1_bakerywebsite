import { Router } from "express";
import { getCategoriesStatus } from "./categories.controller";

const router = Router();

router.get("/", getCategoriesStatus);

export default router;
