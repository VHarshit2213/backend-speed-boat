import { Router } from 'express';
import authRoutes from './auth.routes.js';
import speedboarRoutes from './speedboat.routes.js'
const router = Router();

router.use('/auth', authRoutes);
router.use('/speedboat', speedboarRoutes);

router.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

export default router;
