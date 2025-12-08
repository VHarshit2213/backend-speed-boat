import models from "../models/index.js";
import { touchSpeedboat } from "./speedboat.service.js";
const { Reflection, Speedboat } = models;

export async function createReflection({ speedboat_id, achievements, challenges, learnings, next_actions, needs }) {
  const sb = await Speedboat.findByPk(speedboat_id);
  if (!sb) {
    const err = new Error("Speedboat not found");
    err.status = 404;
    throw err;
  }
  const r = await Reflection.create({ speedboat_id, achievements, challenges, learnings, next_actions, needs });
  await touchSpeedboat(speedboat_id);
  return r;
}

export async function listReflections({ page = 1, limit = 25, speedboat_id }) {
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await Reflection.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["created_at", "DESC"]],
  });
  return { items: rows, total: count, page, limit };
}

export async function getReflectionById(id) {
  return Reflection.findByPk(id);
}

export async function updateReflection(id, updates) {
  const r = await Reflection.findByPk(id);
  if (!r) {
    const err = new Error("Reflection not found");
    err.status = 404;
    throw err;
  }
  await r.update(updates);
  await touchSpeedboat(r.speedboat_id);
  return r;
}

export async function deleteReflection(id) {
  const r = await Reflection.findByPk(id);
  if (r) {
    const speedboatId = r.speedboat_id;
    await Reflection.destroy({ where: { id } });
    await touchSpeedboat(speedboatId);
  }
}
