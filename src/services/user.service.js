import models from "../models/index.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
const { User } = models; 


export const getUserById = async (id, req) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  const userData = user.toJSON();
  console.log(userData);
  userData.profileImage = buildImageUrl(userData.profileImage, req);

  return userData;
};

function buildImageUrl(filename, req) {
  if (!filename) return null;
  const host = req?.get?.("host");
  const protocol = req?.protocol;
  if (!host || !protocol) return null;
  return `${protocol}://${host}/uploads/${filename}`;
}

export const updateUser = async (id, payload, files, req) => {
    const user = await User.findByPk(id);
    if (!user) return ApiResponse.error(res, "User not found", 404);

    // Handle profile image upload
    if (files.profileImage && files.profileImage.length > 0) {
      payload.profileImage = files.profileImage[0].filename;
    }

    // Hash password if updated
    if (payload.password) {
      payload.password = await bcrypt.hash(
        payload.password,
        Number(process.env.BCRYPT_SALT_ROUNDS) || 10
      );
    }

    // Update user
    await user.update(payload);

    // Build image URL for response
    const userData = user.toJSON();
    userData.profileImage = buildImageUrl(userData.profileImage, req);
    return userData;
};


export const deleteUser = async (id) => User.findByPk(id).then(user => user.update({ is_deleted: true })) // soft delete
// export const deleteUser = async (id) => User.destroy({ where: { id } }) // hard delete;

export async function listUsers({
  q,
  page = 1,
  size = 25,
  userId,
}) {
  const offset = (page - 1) * size;

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  const role = user.role;
  if (role !== "admin") throw new Error("Only admins can list users");

  const where = {};

  // exclude users with role "admin"
  where.role = { [Op.ne]: "admin" };

  if (q) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
      { mobile: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: ["id", "fullName", "email", "mobile", "role"],
    limit: Number(size),
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: rows,
    total: count,
    page,
    size,
  };
}
