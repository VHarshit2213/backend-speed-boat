import models from "../models/index.js";
import { Op } from "sequelize";
const { CrewMember, Speedboat } = models;

export async function createCrewMember({ speedboat_id, name }) {
  // validate speedboat existence
  const sb = await Speedboat.findByPk(speedboat_id);
  if (!sb) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  return CrewMember.create({ speedboat_id, name });
}

export async function listCrewMembers({ page = 1, limit = 25, speedboat_id }) {
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await CrewMember.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["name", "ASC"]],
  });
  return { items: rows, total: count, page, limit };
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
  return cm;
}

export async function deleteCrewMember(id) {
  await CrewMember.destroy({ where: { id } });
}
