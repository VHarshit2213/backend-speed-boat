import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as ctrl from "../controllers/statusHistory.controller.js";
import { requireAuth} from '../middlewares/auth.js'

const router = Router();
router.use(requireAuth);

// POST: Create note (When user clicks AT RISK / ON TRACK)
router.post(
  "/:id/status-history",
  asyncHandler(ctrl.create)
);

// GET: Aggregated reasons for modal
router.get(
  "/:id/status-details",
  asyncHandler(ctrl.getDetails)
);

export default router;
