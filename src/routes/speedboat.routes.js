import { Router } from "express";
import * as ctrl from "../controllers/speedboat.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createSpeedboatSchema, updateSpeedboatSchema } from "../validators/speedboat.validator.js";
import { requireAuth} from '../middlewares/auth.js';
import  upload from '../utils/multer.js';
const router = Router();
router.use(requireAuth);

router.post("/", validate(createSpeedboatSchema), asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/deleted", asyncHandler(ctrl.deletedSBlist));
router.get("/documents-deleted", asyncHandler(ctrl.deletedDocumentList));
router.get("/:id", asyncHandler(ctrl.getById));
router.put("/:id", validate(updateSpeedboatSchema), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove)); 
router.post("/:id/restore", asyncHandler(ctrl.restore));
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
router.post("/:id/calculate-progress", asyncHandler(ctrl.recomputeProgress));
// use multer middleware to accept multiple files under field name "files"
router.post(
  "/:id/upload-files",
  upload.array("files", 5),
  asyncHandler(ctrl.uploadFiles)
);

// delete a document by its ID
router.delete(
  "/documents/:documentId",
  asyncHandler(ctrl.deleteDocument)
);

export default router;
