import jwt from "jsonwebtoken";
import models from "../models/index.js";
const { User } = models;

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token required" });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { sub, role, iat, exp }

    // Sequelize: fetch user by PK (id)
    const user = await User.findByPk(decoded.sub, {
      attributes: { exclude: ["password"] }, // remove password field
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token, user not found" });
    }

    // Expose consistent fields
    req.auth = decoded;   // raw JWT payload
    req.user = user;      // Sequelize instance (with toJSON if needed)
    req.userId = user.id; // Sequelize uses `id`

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
