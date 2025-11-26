import { Router } from "express";
import * as ctrl from "../controllers/crewMember.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createCrewMemberSchema, updateCrewMemberSchema } from "../validators/crewMember.validator.js";

const router = Router();

router.post("/", validate(createCrewMemberSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateCrewMemberSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
