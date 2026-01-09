import { Router } from "express";
import * as ctrl from "../controllers/speedboat.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createSpeedboatSchema, updateSpeedboatSchema } from "../validators/speedboat.validator.js";
import { requireAuth} from '../middlewares/auth.js'
const router = Router();
router.use(requireAuth);

router.post("/", validate(createSpeedboatSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateSpeedboatSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove)); 
router.post(
  "/share/:id", asyncHandler(ctrl.bulkShareSpeedboat)
);

router.delete(
  "/:id/revoke/:userId",
   asyncHandler(ctrl.revokeSpeedboatAccess)
);
router.get(
  "/accessible",
  asyncHandler(ctrl.listAccessibleSpeedboats)
);
// business endpoints
router.post("/:id/recompute-health", asyncHandler(ctrl.computeHealth));
router.post("/:id/refresh-milestones", asyncHandler(ctrl.updateMilestonesStatuses));
router.post("/:id/calculate-progress", asyncHandler(ctrl.recomputeProgress))

export default router;
