import { Router } from "express";
import * as ctrl from "../controllers/kpi.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createKPISchema, updateKPISchema, reorderKPISchema } from "../validators/kpi.validator.js";
import { requireAuth} from '../middlewares/auth.js'

const router = Router();
router.use(requireAuth);

router.post("/", validate(createKPISchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/deleted", asyncHandler(ctrl.deletedKPIList));
router.post("/reorder", validate(reorderKPISchema), asyncHandler(ctrl.reorder));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateKPISchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));
router.post("/:id/restore", asyncHandler(ctrl.restore));

export default router;
