import models from "../models/index.js";
import dayjs from "dayjs";

const { StatusHistory, Speedboat, KPI, Milestone, CrewMember, User } = models;

// Create note
export async function createStatusNote(speedboatId, payload, userId) {
  const sb = await Speedboat.findByPk(speedboatId);
  if (!sb) throw new Error("Speedboat not found");

  if (sb.userId !== userId) throw new Error("You are not the owner of this speedboat");

  return StatusHistory.create({
    speedboat_id: speedboatId,
    status: payload.status,
    category: payload.category,
    details: payload.details,
    kpi_ids: payload.kpi_ids || [],
    created_by: userId || null
  });
}


// AGGREGATED STATUS DETAILS FOR MODAL
export async function getStatusDetails(speedboatId) {
  const sb = await Speedboat.findByPk(speedboatId, {
    include: [
      { model: KPI, as: "kpis", required: false },
      { model: Milestone, as: "milestones", required: false },
      { model: CrewMember, as: "crew", required: false }
    ]
  });

  if (!sb) throw new Error("Speedboat not found");

  // ===== TIME PROGRESS =====
  let timeProgress = null;
  if (sb.start_date && sb.end_date) {
    const total = dayjs(sb.end_date).diff(dayjs(sb.start_date), "day");
    const passed = dayjs().diff(dayjs(sb.start_date), "day");
    const percent = Math.max(0, Math.min(100, (passed / total) * 100));

    timeProgress = { totalDays: total, daysPassed: passed, percent };
  }

  // ===== FAILING KPIs =====
  const failingKPIs = (sb.kpis || []).filter(k => {
    if (k.target == null || k.current == null) return false;
    if (k.isCompleted) return false; // skip completed KPIs
    return Number(k.current) < Number(k.target); // simple rule
  });

  // ===== OVERDUE MILESTONES =====
  const overdueMilestones = (sb.milestones || []).filter(m => {
    if (!m.due_date || m.status === "done" || m.status === "Done") return false;
    return dayjs().isAfter(dayjs(m.due_date), "day");
  });

  // ===== STATUS HISTORY =====
  const notes = await StatusHistory.findAll({
    where: { speedboat_id: speedboatId },
    include: [{ model: User, as: "author", attributes: ["id", "fullName"], required: false }],
    order: [["created_at", "DESC"]],
    limit: 20
  });

  return {
    speedboat: sb,
    timeProgress,
    failingKPIs,
    overdueMilestones,
    crew: sb.crew,
    notes
  };
}
