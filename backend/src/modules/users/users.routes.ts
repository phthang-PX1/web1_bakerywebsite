import { Router } from "express";
import { getUsersStatus } from "./users.controller";

const router = Router();

router.get("/", getUsersStatus);

export default router;
