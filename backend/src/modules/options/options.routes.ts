import { Router } from "express";
import { getOptionsStatus } from "./options.controller";

const router = Router();

router.get("/", getOptionsStatus);

export default router;
