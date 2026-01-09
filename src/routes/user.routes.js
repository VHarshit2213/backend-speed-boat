// src/routes/user.routes.js
import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as userCtrl from '../controllers/user.controller.js';
import { requireAuth} from '../middlewares/auth.js'
const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(userCtrl.list));
router.post('/', asyncHandler(userCtrl.create));
router.get(
  "/list",
  asyncHandler(userCtrl.listUsers)
);

export default router; 
