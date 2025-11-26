import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userProfileRoutes from './user.profile.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', userProfileRoutes);

router.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

export default router;
