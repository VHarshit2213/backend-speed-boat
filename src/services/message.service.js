import models from "../models/index.js";

const { Message, Speedboat } = models;

export async function createMessage(payload, userId) {
  const sb = await Speedboat.findByPk(payload.speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }

  return Message.create(payload);
}

export async function listMessages({ speedboat_id, page = 1, limit = 50 }, userId) {
  const sb = await Speedboat.findByPk(speedboat_id);
  // if (!sb || sb.userId !== userId) {
  //   const err = new Error("Speedboat not found or not owned by you");
  //   err.status = 404;
  //   throw err;
  // }
  const offset = (page - 1) * limit;
  const where = {};
  if (speedboat_id) where.speedboat_id = speedboat_id;

  const { rows, count } = await Message.findAndCountAll({
    where, order: [["created_at", "DESC"]], limit: Number(limit), offset: Number(offset)
  });

  return { items: rows, total: count, page, limit };
}

export async function getMessageById(id) {
  return Message.findByPk(id);
}

export async function updateMessage(id, updates) {
  const msg = await Message.findByPk(id);
  if (!msg) {
    const err = new Error("Message not found");
    err.status = 404;
    throw err;
  }
  return msg.update(updates);
}

export async function deleteMessage(id, userId) {
  const deleted = await Message.findByPk(id);
  if (!deleted) {
    const err = new Error("Message not found");
    err.status = 404;
    throw err;
  }
  // soft delete
  await Message.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId }, { where: { id } });
  // await Message.destroy({ where: { id } });
}
