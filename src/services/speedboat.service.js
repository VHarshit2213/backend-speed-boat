import models from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import dayjs from "dayjs";
import fs from "fs/promises";
import path from "path";

const {
  Speedboat,
  User,
  CrewMember,
  KPI,
  Milestone,
  NextAction,
  Reflection,
  Dependency,
  Message,
  BudgetResource,
  SpeedboatAccess,
  Document,
} = models;

/**
 * Compute frontend health status based ONLY on average KPI progress.
 *
 * Status meanings:
 * - On Track  : Average progress >= 70%
 * - Pending   : Average progress >= 40%
 * - At Risk   : Average progress < 40%
 */
export async function computeHealthForSpeedboat(speedboat) {
  // Manual override always wins
  if (speedboat.manual_health_override) {
    return speedboat.health || "Pending";
  }

  const kpis =
    speedboat.kpis ??
    await KPI.findAll({ where: { speedboat_id: speedboat.id } });

  if (!kpis || kpis.length === 0) return "Pending";

  const progress = await computeProgressForSpeedboat(speedboat);

  if (progress >= 70) return "On Track";
  if (progress >= 40) return "Pending";
  return "At Risk";
}

/* CRUD / listing */
export async function createSpeedboat(payload) {
  const {
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
    crew,
    kpis,
    milestones,
    nextActions,
    reflections,
    dependencies,
    userId,
    ...rest
  } = payload;

  // Create speedboat with new fields included
  const speedboat = await Speedboat.create({
    ...rest,
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
    userId,
  });

  if (Array.isArray(crew)) {
    const items = crew.map((c) => {
      if (typeof c === "string") return { speedboat_id: speedboat.id, name: c };
      const { name, slack_id } = c || {};
      return { speedboat_id: speedboat.id, name, slack_id };
    });
    await CrewMember.bulkCreate(items);
  }

  if (Array.isArray(kpis)) {
    const items = kpis.map((k, idx) => {
      const { position, ...rest } = k || {};
      return {
        ...rest,
        position: position != null ? position : idx,
        speedboat_id: speedboat.id,
      };
    });
    await KPI.bulkCreate(items);
  }

  if (Array.isArray(milestones)) {
    const items = milestones.map(m => ({ ...m, speedboat_id: speedboat.id }));
    await Milestone.bulkCreate(items);
  }

  if (Array.isArray(nextActions)) {
    const items = nextActions.map(n => ({ ...n, speedboat_id: speedboat.id }));
    await NextAction.bulkCreate(items);
  }

  if (Array.isArray(reflections)) {
    const items = reflections.map(r => ({ ...r, speedboat_id: speedboat.id }));
    await Reflection.bulkCreate(items);
  }

  if (Array.isArray(dependencies)) {
    const items = dependencies.map(depId => ({
      speedboat_id: speedboat.id,
      depends_on_speedboat_id: depId,
    }));
    await Dependency.bulkCreate(items);
  }

  // return full object
  const newSpeedBoat = await getSpeedboat(speedboat.id);
  // refreshMilestoneStatuses(newSpeedBoat.id);
  const health = await computeHealthForSpeedboat(newSpeedBoat);
  const progress = await computeProgressForSpeedboat(newSpeedBoat);
  newSpeedBoat.health = health;
  newSpeedBoat.progress = progress;
  await newSpeedBoat.save();
  return newSpeedBoat;
}
export async function listSpeedboats({
  q,
  navigator,
  health,
  progressMin,
  progressMax,
  page = 1,
  size = 10,
  userId,
}) {
  const offset = (page - 1) * size;
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  const role = user.role;

  let where = {};

  if (role !== "admin") {
    where[Op.or] = [
      { userId }, // owned
      {
        id: {
          [Op.in]: Sequelize.literal(`
            (SELECT speedboat_id
             FROM speedboat_access
             WHERE user_id = '${userId}')
          `),
        },
      },
    ];
  }

  // 🔍 Search
  if (q) {
    where[Op.and] = [
      ...(where[Op.and] || []),
      {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          Sequelize.literal(`
            EXISTS (
              SELECT 1
              FROM unnest("Speedboat"."navigators") AS n
              WHERE n ILIKE '%${q}%'
            )
          `),
        ],
      },
    ];
  }

  if (health) where.health = health;

  if (progressMin || progressMax) {
    where.progress = {};
    if (progressMin) where.progress[Op.gte] = Number(progressMin);
    if (progressMax) where.progress[Op.lte] = Number(progressMax);
  }

  const { rows, count } = await Speedboat.findAndCountAll({
    where,
    limit: Number(size),
    offset,
    distinct: true,
    order: [["created_at", "DESC"]],
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      { model: Message, as: "messages" },
      { model: BudgetResource, as: "budgetResources" },
      { model: User, as: "sharedUsers", through: { attributes: [] } },
      { model: Document, as: "documents" },
    ],
  });

  return { items: rows, total: count, page, size };
}


export async function getSpeedboatById(id, userId) {
  const speedboat = await Speedboat.findByPk(id, {
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      { model: Message, as: "messages" },
      { model: BudgetResource, as: "budgetResources" },
      { model: Document, as: "documents" },
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });

  if (!speedboat) return null;

  // sort included arrays by created_at (oldest → newest). Change compare to invert for newest first.
  const sortByCreatedAt = (arr) => {
    if (!Array.isArray(arr)) return;
    arr.sort((a, b) => {
      const hasPosA = Number.isFinite(a?.position);
      const hasPosB = Number.isFinite(b?.position);
      if (hasPosA && hasPosB && a.position !== b.position) {
        return a.position - b.position;
      }
      const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return da - db;
    });
  };

  sortByCreatedAt(speedboat.crew);
  sortByCreatedAt(speedboat.kpis);
  sortByCreatedAt(speedboat.milestones);
  sortByCreatedAt(speedboat.nextActions);
  sortByCreatedAt(speedboat.reflections);
  sortByCreatedAt(speedboat.messages);
  sortByCreatedAt(speedboat.budgetResources);
  sortByCreatedAt(speedboat.dependsOn);

  //  if (!speedboat || speedboat.userId !== userId) {
  //    const err = new Error("Speedboat not found or not owned by you");
  //     err.status = 404; throw err; }
  return speedboat;
}

export async function getSpeedboat(id) {
  const speedboat = await Speedboat.findByPk(id, {
    include: [
      { model: CrewMember, as: "crew" },
      { model: KPI, as: "kpis" },
      { model: Milestone, as: "milestones" },
      { model: NextAction, as: "nextActions" },
      { model: Reflection, as: "reflections" },
      { model: Message, as: "messages" },
      { model: BudgetResource, as: "budgetResources" },
      {
        model: Speedboat,
        as: "dependsOn",
        through: { attributes: [] },
      },
    ],
  });

  if (!speedboat) return null;

  const sortByCreatedAt = (arr) => {
    if (!Array.isArray(arr)) return;
    arr.sort((a, b) => {
      const hasPosA = Number.isFinite(a?.position);
      const hasPosB = Number.isFinite(b?.position);
      if (hasPosA && hasPosB && a.position !== b.position) {
        return a.position - b.position;
      }
      const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return da - db;
    });
  };

  sortByCreatedAt(speedboat.crew);
  sortByCreatedAt(speedboat.kpis);
  sortByCreatedAt(speedboat.milestones);
  sortByCreatedAt(speedboat.nextActions);
  sortByCreatedAt(speedboat.reflections);
  sortByCreatedAt(speedboat.messages);
  sortByCreatedAt(speedboat.budgetResources);
  sortByCreatedAt(speedboat.dependsOn);

  return speedboat;
}

export async function updateSpeedboat(id, updates, userId) {
  const speedboat = await Speedboat.findByPk(id);

  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  // Permission check (OWNER OR SHARED USER)
  const isOwner = speedboat.userId === userId;

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  let hasAccess = false;

  // if (!isOwner) {
  //   const access = await SpeedboatAccess.findOne({
  //     where: {
  //       speedboat_id: id,
  //       user_id: userId,
  //     },
  //   });
  //   hasAccess = !!access;
  // }

  if (user.role === "admin") {
    hasAccess = true;
  }

  // if (!isOwner && !hasAccess) {
  //   const err = new Error("You do not have access to update this speedboat");
  //   err.status = 403;
  //   throw err;
  // }

  const {
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
    crew,
    kpis,
    milestones,
    nextActions,
    reflections,
    dependencies,
    ...rest
  } = updates;

  // Update main speedboat table including new fields
  await speedboat.update({
    ...rest,
    guiding_spirit,
    challenge,
    measurement_of_success,
    current_status,
  });

  // For nested arrays we will do simple replace strategy
  if (Array.isArray(crew)) {
    await CrewMember.destroy({ where: { speedboat_id: id } });
    const items = crew.map((c) => {
      if (typeof c === "string") return { name: c, speedboat_id: id };
      const { name, email } = c || {};
      return { name, email, speedboat_id: id };
    });
    if (items.length) await CrewMember.bulkCreate(items);
  }

  if (Array.isArray(kpis)) {
    await KPI.destroy({ where: { speedboat_id: id } });
    const items = kpis.map((k, idx) => {
      const { position, ...rest } = k || {};
      return {
        ...rest,
        position: position != null ? position : idx,
        speedboat_id: id,
      };
    });
    if (items.length) await KPI.bulkCreate(items);
  }

  if (Array.isArray(milestones)) {
    await Milestone.destroy({ where: { speedboat_id: id } });
    const items = milestones.map(m => ({ ...m, speedboat_id: id }));
    if (items.length) await Milestone.bulkCreate(items);
  }

  if (Array.isArray(nextActions)) {
    await NextAction.destroy({ where: { speedboat_id: id } });
    const items = nextActions.map(n => ({ ...n, speedboat_id: id }));
    if (items.length) await NextAction.bulkCreate(items);
  }

  if (Array.isArray(reflections)) {
    await Reflection.destroy({ where: { speedboat_id: id } });
    const items = reflections.map(r => ({ ...r, speedboat_id: id }));
    if (items.length) await Reflection.bulkCreate(items);
  }

  if (Array.isArray(dependencies)) {
    await Dependency.destroy({ where: { speedboat_id: id } });
    const items = dependencies.map(depId => ({
      speedboat_id: id,
      depends_on_speedboat_id: depId,
    }));
    if (items.length) await Dependency.bulkCreate(items);
  }

  // Recompute derived fields based on latest KPIs
  const refreshed = await getSpeedboat(id);
  const progress = await computeProgressForSpeedboat(refreshed);
  const health = await computeHealthForSpeedboat(refreshed);

  refreshed.progress = progress;
  if (!refreshed.manual_health_override) {
    refreshed.health = health;
  }
  await refreshed.save();

  return refreshed;
}

export async function deleteSpeedboat(id, userId) {
  const speedboat = await Speedboat.findByPk(id);
  if (!speedboat || speedboat.userId !== userId) {
    const err = new Error("Speedboat not found or not owned by you");
    err.status = 404;
    throw err;
  }
  await Speedboat.destroy({ where: { id } });
}

/**
 * Compute progress based ONLY on KPI achievement percentages.
 * Progress reflects current/target ratio (baseline ignored).
 *
 * Formula:
 * KPI% = (current / target) * 100
 * Progress (%) = Average of all KPI%
 */
export async function computeProgressForSpeedboat(speedboat) {
  const kpis =
    speedboat.kpis ??
    await KPI.findAll({ where: { speedboat_id: speedboat.id } });

  if (!kpis || kpis.length === 0) return 0;

  let total = 0;
  let count = 0;

  for (const k of kpis) {
    if (k.current == null || k.target == null) continue;

    const target = Number(k.target);
    const current = Number(k.current);

    if (!Number.isFinite(target) || target === 0) continue;
    if (!Number.isFinite(current)) continue;

    const pct = (current / target) * 100;

    total += pct;
    count++;
  }

  if (count === 0) return 0;

  return Math.round(total / count);
}



/**
 * Touch speedboat updated_at
 */
export async function touchSpeedboat(id) {
  await Speedboat.update({ updated_at: new Date() }, { where: { id } });
}

/**
 * Persist uploaded files as Document rows and keep speedboat.files in sync (legacy field)
 */
export async function addFilesToSpeedboat(speedboatId, files = []) {
  const speedboat = await Speedboat.findByPk(speedboatId);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  // Normalize payload for Document table
  const docsPayload = files.map((f) => ({
    speedboat_id: speedboatId,
    file_name: f.fileName || f.filename,
    original_name: f.originalName || f.originalname,
    mime_type: f.mimeType || f.mimetype,
    size: f.size,
    path: f.path,
    url: f.url,
  }));

  const createdDocs = await Document.bulkCreate(docsPayload, { returning: true });

  // Legacy compatibility: mirror into speedboat.files
  const existing = Array.isArray(speedboat.files) ? speedboat.files : [];
  const docsMeta = createdDocs.map((d) => ({
    id: d.id,
    fileName: d.file_name,
    originalName: d.original_name,
    mimeType: d.mime_type,
    size: d.size,
    path: d.path,
    url: d.url,
  }));
  speedboat.files = existing.concat(docsMeta);
  await speedboat.save();

  return createdDocs;
}

/**
 * Delete a document by ID and clean up disk + legacy files array.
 */
export async function deleteDocument(documentId, user) {
  const document = await Document.findByPk(documentId);
  if (!document) {
    const err = new Error("Document not found");
    err.status = 404;
    throw err;
  }

  const speedboat = await Speedboat.findByPk(document.speedboat_id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  // Allow deletion by owner, admins, or anyone with explicit access (e.g., assigned captain)
  const isOwner = speedboat.userId === user.id;
  const isAdmin = user?.role === "admin";
  const hasAccess = await SpeedboatAccess.findOne({
    where: { speedboat_id: speedboat.id, user_id: user.id },
  });

  if (!isOwner && !isAdmin && !hasAccess) {
    const err = new Error("You do not have permission to delete this document");
    err.status = 403;
    throw err;
  }

  await document.destroy();

  // Update legacy files array
  const existing = Array.isArray(speedboat.files) ? speedboat.files : [];
  speedboat.files = existing.filter((f) => f?.id !== document.id && f?.fileName !== document.file_name);
  await speedboat.save();

  // Attempt to delete from disk; ignore errors (e.g., file already gone)
  if (document.path) {
    const absolute = path.isAbsolute(document.path)
      ? document.path
      : path.join(process.cwd(), document.path);
    try {
      await fs.unlink(absolute);
    } catch (_) {
      // swallow file removal errors to avoid blocking API
    }
  }

  return { deleted: true };
}

/**
 * Recompute and update progress
 */
export async function recomputeProgress(id) {
  const speedboat = await getSpeedboat(id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  const progress = await computeProgressForSpeedboat(speedboat);
  const health = await computeHealthForSpeedboat(speedboat);
  speedboat.progress = progress;
  speedboat.health = health;
  await speedboat.save();
  return { id: speedboat.id, progress };
}

/**
 * recompute health & save
 */
export async function recomputeHealth(id) {
  const speedboat = await getSpeedboat(id);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  const health = await computeHealthForSpeedboat(speedboat);
  speedboat.health = health;
  await speedboat.save();
  return { id: speedboat.id, health };
}

/**
 * Refresh milestone statuses using the rules:
 * - pending when created
 * - on-track if current date < due date
 * - at-risk if 3-7 days overdue
 * - done when marked completed (status == 'done')
 */
export async function refreshMilestoneStatuses(speedboatId) {
  const milestones = await Milestone.findAll({ where: { speedboat_id: speedboatId } });
  const now = dayjs();

  for (const m of milestones) {
    if (m.status === "Done") continue;
    if (!m.due_date) {
      m.status = "Pending";
      await m.save();
      continue;
    }
    const due = dayjs(m.due_date);
    if (due.isAfter(now, "day")) {
      m.status = "On Track";
    } else {
      const daysOver = now.diff(due, "day");
      if (daysOver >= 3 && daysOver <= 7) m.status = "At Risk";
      else if (daysOver > 7) m.status = "At Risk"; // treat >7 as at-risk (client rule can be adjusted)
      else m.status = "At Risk"; // 0-2 days overdue => at-risk
    }
    await m.save();
  }

  // return updated list
  return Milestone.findAll({ where: { speedboat_id: speedboatId } });
}


export async function bulkShareSpeedboat({ speedboatId, userIds, adminId }) {

  console.log("bulkShareSpeedboat called with:", { speedboatId, userIds, adminId });

  const speedboat = await Speedboat.findByPk(speedboatId);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  const user = await User.findByPk(adminId);
  console.log("user.....", user);
  if (!user || user.role !== "admin") {
    const err = new Error("Only admins can share speedboats");
    err.status = 403;
    throw err;
  }
  const records = userIds.map((userId) => ({
    speedboat_id: speedboatId,
    user_id: userId,
    granted_by: adminId,
  }));

  await SpeedboatAccess.bulkCreate(records, {
    ignoreDuplicates: true,
  });

  return { sharedCount: userIds.length };
}

export async function listAccessibleSpeedboats({
  userId,
  page = 1,
  size = 25,
}) {
  const offset = (page - 1) * size;

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const role = user.role;

  let where = {};

  // Admin → all speedboats
  if (role !== "admin") {
    where[Op.or] = [
      { userId }, // owner
      {
        id: {
          [Op.in]: Sequelize.literal(`
            (SELECT speedboat_id
             FROM speedboat_access
             WHERE user_id = '${userId}')
          `),
        },
      },
    ];
  }

  const { rows, count } = await Speedboat.findAndCountAll({
    where,
    limit: Number(size),
    offset,
    order: [["created_at", "DESC"]],
    distinct: true,
    include: [
      { model: User, as: "owner", attributes: ["id", "fullName", "email"] },
      { model: User, as: "sharedUsers", through: { attributes: [] } },
    ],
  });

  return {
    items: rows,
    total: count,
    page,
    size,
  };
}


export async function revokeSpeedboatAccess({
  speedboatId,
  userId,
  adminId,
}) {
  //  Check speedboat exists
  const speedboat = await Speedboat.findByPk(speedboatId);
  if (!speedboat) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }

  const adminUser = await User.findByPk(adminId);
  if (!adminUser || adminUser.role !== "admin") {
    const err = new Error("Only admins can revoke access");
    err.status = 403;
    throw err;
  }

  //  Prevent revoking owner access
  if (speedboat.userId === userId) {
    const err = new Error("Cannot revoke access from the owner");
    err.status = 400;
    throw err;
  }

  // Delete access
  const deleted = await SpeedboatAccess.destroy({
    where: {
      speedboat_id: speedboatId,
      user_id: userId,
    },
  });

  if (!deleted) {
    const err = new Error("User does not have access to this speedboat");
    err.status = 404;
    throw err;
  }

  return {
    message: "Access revoked successfully",
    speedboatId,
    userId,
    revokedBy: adminId,
  };
}
