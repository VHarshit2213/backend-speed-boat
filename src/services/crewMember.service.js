import models from "../models/index.js";
import { Op } from "sequelize";
import { touchSpeedboat } from "./speedboat.service.js";
const { CrewMember, Speedboat } = models;

export async function createCrewMember({ speedboat_id, name, slack_id }, userId) {
  // validate speedboat existence
  const sb = await Speedboat.findByPk(speedboat_id);
  
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  const cm = await CrewMember.create({ speedboat_id, name, slack_id });
  await touchSpeedboat(speedboat_id);
  return cm;
}

export async function listCrewMembers({ page = 1, size = 25, speedboat_id }, userId) {
 const sb = await Speedboat.findByPk(speedboat_id);
  
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }

  const offset = (page - 1) * size;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await CrewMember.findAndCountAll({
    where,
    limit: Number(size),
    offset: Number(offset),
    order: [["created_at", "DESC"]],
  });
  return { items: rows, total: count, page, size };
}

export async function getCrewMemberById(id) {
  return CrewMember.findByPk(id);
}

export async function updateCrewMember(id, updates) {
  const cm = await CrewMember.findByPk(id);
  if (!cm) {
    const err = new Error("Crew member not found");
    err.status = 404;
    throw err;
  }
  await cm.update(updates);
  await touchSpeedboat(cm.speedboat_id);
  return cm;
}

export async function deleteCrewMember(id, userId) {
  const cm = await CrewMember.findByPk(id);
  if (!cm) {
    const err = new Error("Crew member not found");
    err.status = 404;
    throw err;
  }
  if (cm) {
    const speedboatId = cm.speedboat_id;
    // soft delete
    await CrewMember.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId }, { where: { id } });
    // await CrewMember.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
  }
}

export async function deletedListCrewMembers({ page = 1, size = 25, speedboat_id }, userId) {
 const sb = await Speedboat.findByPk(speedboat_id);

  const offset = (page - 1) * size;
  const where = {
    is_deleted: true
  };
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await CrewMember.unscoped().findAndCountAll({
    where,
    limit: Number(size),
    offset: Number(offset),
    order: [["deleted_at", "DESC"]],
    include: [
      { model: models.User, as: "deletedByUser", attributes: ["id", "fullName", "email", "profileImage", "role"] },
      { model: Speedboat, as: "speedboat", attributes: ["name"] }
    ]
  });
  return { items: rows, total: count, page, size };
}

export async function restoreCrewMember(id, userId) {
  const cm = await CrewMember.unscoped().findByPk(id);
  if (!cm || !cm.is_deleted) {
    const err = new Error("Deleted crew member not found");
    err.status = 404;
    throw err;
  }

  await cm.update({
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
  });

  await touchSpeedboat(cm.speedboat_id);
  return cm;
}
