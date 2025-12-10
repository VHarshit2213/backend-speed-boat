import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import * as authCtrl from '../controllers/auth.controller.js';
const router = Router();

router.post('/signup', validate(authCtrl.registerSchema), asyncHandler(authCtrl.register));
router.post('/signin', validate(authCtrl.loginSchema),    asyncHandler(authCtrl.login));
router.post('/verify-otp', asyncHandler(authCtrl.verifyOtp))
router.post("/forgot-password", asyncHandler(authCtrl.forgotPassword));
router.post("/reset-password", asyncHandler(authCtrl.resetPassword));

export default router;
    