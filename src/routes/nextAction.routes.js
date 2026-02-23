import { Router } from "express";
import * as ctrl from "../controllers/nextAction.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createNextActionSchema, updateNextActionSchema, reorderNextActionSchema } from "../validators/nextAction.validator.js";
import { requireAuth} from '../middlewares/auth.js'

const router = Router();
router.use(requireAuth);
router.post("/", validate(createNextActionSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/deleted", asyncHandler(ctrl.deletedNextActionList));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateNextActionSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));
router.post("/reorder", validate(reorderNextActionSchema), asyncHandler(ctrl.reorder));
router.post("/:id/restore", asyncHandler(ctrl.restore));

export default router;
