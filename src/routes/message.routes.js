import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import * as ctrl from "../controllers/message.controller.js";
import { createMessageSchema } from "../validators/message.validator.js";

const router = Router();

router.post("/", validate(createMessageSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
