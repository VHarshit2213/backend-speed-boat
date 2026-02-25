import { Router } from 'express';
import authRoutes from './auth.routes.js';
import speedboarRoutes from './speedboat.routes.js'
import crewRoutes from "./crewMember.routes.js";
import kpiRoutes from "./kpi.routes.js";
import milestoneRoutes from "./milestone.routes.js";
import nextActionRoutes from "./nextAction.routes.js";
import reflectionRoutes from "./reflection.routes.js";
import dependencyRoutes from "./dependency.routes.js";
import statusHistoryRoutes from "./statusHistory.routes.js";
import budgetRoutes from "./budgetResource.routes.js";
import messageRoutes from "./message.routes.js";
import userRoutes from "./user.routes.js";
const router = Router();

router.use('/auth', authRoutes);
router.use('/speedboat', speedboarRoutes);
router.use("/crew", crewRoutes);
router.use("/kpis", kpiRoutes);
router.use("/milestones", milestoneRoutes);
router.use("/next-actions", nextActionRoutes);
router.use("/reflections", reflectionRoutes);
router.use("/dependencies", dependencyRoutes);
router.use("/speedboat", statusHistoryRoutes);
router.use("/budget-resources", budgetRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);

router.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

export default router;
