import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as ctrl from "../controllers/statusHistory.controller.js";

const router = Router();

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
