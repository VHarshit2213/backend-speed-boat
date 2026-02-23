import models from "../models/index.js";
const { Dependency, Speedboat } = models;

export async function createDependency({ speedboat_id, depends_on_speedboat_id }, userId) {
  if (speedboat_id === depends_on_speedboat_id) {
    const err = new Error("A speedboat cannot depend on itself");
    err.status = 400;
    throw err;
  }

  const sb = await Speedboat.findByPk(speedboat_id);
  const sb2 = await Speedboat.findByPk(depends_on_speedboat_id);

  //  if (!sb || sb.userId !== userId) { const err = new Error("Speedboat not found or not owned by you"); err.status = 404; throw err; }

  // if (!sb2 || sb2.userId !== userId) { const err = new Error("Speedboat not found or not owned by you"); err.status = 404; throw err; }

  // prevent duplicates (unique index exists in DB)
  const existing = await Dependency.findOne({
    where: { speedboat_id, depends_on_speedboat_id },
  });
  if (existing) {
    const err = new Error("Dependency already exists");
    err.status = 409;
    throw err;
  }

  return Dependency.create({ speedboat_id, depends_on_speedboat_id });
}

export async function listDependencies({ page = 1, limit = 25, speedboat_id }, userId) {

   const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }

  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;
  const { rows, count } = await Dependency.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    include: [
      { model: Speedboat, as: "speedboat", required: false },
      { model: Speedboat, as: "dependsOnSpeedboat", required: false },
    ],
    order: [["created_at", "DESC"]],
  });
  return { items: rows, total: count, page, limit };
}

export async function getDependencyById(id) {
  return Dependency.findByPk(id);
}

export async function deleteDependency(id, userId) {
  const deleted = await Dependency.findByPk(id);
  if (!deleted) {
    const err = new Error("Dependency not found");
    err.status = 404;
    throw err;
  }
  //soft delete
  await Dependency.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId }, { where: { id } });
  // await Dependency.destroy({ where: { id } });
}
