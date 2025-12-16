import { Router } from "express";
import * as ctrl from "../controllers/reflection.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth} from '../middlewares/auth.js'
const router = Router();
router.use(requireAuth);
router.post("/",  asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
