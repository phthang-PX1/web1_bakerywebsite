import { Router } from "express";
import { getAuthStatus } from "./auth.controller";

const router = Router();

router.get("/", getAuthStatus);

export default router;
