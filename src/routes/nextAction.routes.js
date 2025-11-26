import { Router } from "express";
import * as ctrl from "../controllers/nextAction.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createNextActionSchema, updateNextActionSchema } from "../validators/nextAction.validator.js";

const router = Router();

router.post("/", validate(createNextActionSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateNextActionSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
