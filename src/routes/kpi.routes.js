import { Router } from "express";
import * as ctrl from "../controllers/kpi.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createKPISchema, updateKPISchema } from "../validators/kpi.validator.js";

const router = Router();

router.post("/", validate(createKPISchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateKPISchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
