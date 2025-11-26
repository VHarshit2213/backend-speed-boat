import { Router } from "express";
import * as ctrl from "../controllers/dependency.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
