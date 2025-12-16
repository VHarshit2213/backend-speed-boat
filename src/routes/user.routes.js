// src/routes/user.routes.js
import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as userCtrl from '../controllers/auth.controller.js';
import { requireAuth} from '../middlewares/auth.js'
const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(userCtrl.list));
router.post('/', asyncHandler(userCtrl.create));

export default router; 
