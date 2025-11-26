import models from "../models/index.js";
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


export const deleteUser = async (id) => User.findByPk(id).then(user => user.destroy());