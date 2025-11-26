import { Router } from "express";
import * as ctrl from "../controllers/milestone.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createMilestoneSchema, updateMilestoneSchema } from "../validators/milestone.validator.js";

const router = Router();

router.post("/", validate(createMilestoneSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateMilestoneSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
