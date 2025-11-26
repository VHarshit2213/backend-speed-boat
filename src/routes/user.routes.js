// src/routes/user.routes.js
import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as userCtrl from '../controllers/auth.controller.js';

const router = Router();

router.get('/', asyncHandler(userCtrl.list));
router.post('/', asyncHandler(userCtrl.create));

export default router; 
