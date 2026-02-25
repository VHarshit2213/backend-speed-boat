import { Router } from "express";
import * as ctrl from "../controllers/crewMember.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createCrewMemberSchema, updateCrewMemberSchema } from "../validators/crewMember.validator.js";
import { requireAuth} from '../middlewares/auth.js'

const router = Router();
router.use(requireAuth);
router.post("/", validate(createCrewMemberSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/deleted", asyncHandler(ctrl.deletedCrewList));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateCrewMemberSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));
router.post("/:id/restore", asyncHandler(ctrl.restore));

export default router;
