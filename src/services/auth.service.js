import { Op } from "sequelize";
import models from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { User} = models;

// JWT helper
const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "28d",
  });

//  Register
export async function register({ fullName, email, mobile, password }) {
  // Check if user exists (manual validation before hitting DB constraint)
  const exists = await User.findOne({
    where: {
      [Op.or]: [{ email }],
    },
  });

  if (exists) {
    console.log("Found existing user:", exists.toJSON());
    const err = new Error("Email or mobile already in use");
    err.status = 409;
    throw err;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10
  );

  try {
    // Create user
    const user = await User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
    });

    const token = signToken(user);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    };
  } catch (err) {
    // Handle DB unique constraint errors safely
    if (err.name === "SequelizeUniqueConstraintError") {
      const error = new Error("Email or mobile already exists");
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

//  Login
export async function login({ email, password }) {
  const user = await User.findOne({
    where: { email },
    attributes: ["id", "fullName", "email", "mobile", "role", "password"],
  });


  if (!user) {
    const err = new Error("User not Found with this email");
    err.status = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  const { id, fullName, email: userEmail, mobile, role } = user;

 

  return {
    token,
    user: { id, fullName, email: userEmail, mobile, role },
  };
}



// Forgot password
export async function forgotPassword({ email }) {
  if (!email) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  // 1. Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // 2. Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "super_secret_key",
    { expiresIn: "1h" }
  );

  const resetLink = `https://speedBoat.com/reset-password?token=${token}`;

  //   // 3. Send email
  console.log("Sending password reset email to:", user.email);
  const result = await sendMail({
    to: user.email,
    subject: "Reset your speedBoat password",
    html: forgotPasswordTemplate(user.fullName, resetLink),
  });


  return { message: "Password reset link sent to your email" };
}

// Reset password
export async function resetPassword({ token, newPassword }) {
  if (!token) {
    const err = new Error("Token is required");
    err.status = 400;
    throw err;
  }

  if (!newPassword) {
    const err = new Error("Password is required");
    err.status = 400;
    throw err;
  }

  if (newPassword.length < 12) {
    const err = new Error("Password must be at least 12 characters");
    err.status = 400;
    throw err;
  }

  // 1. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_key");
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.status = 400;
    throw error;
  }

  // 2. Find user
  const user = await User.findByPk(decoded.userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // 3. Check same password
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    const err = new Error("New password cannot be same as old");
    err.status = 400;
    throw err;
  }

  // 4. Hash & save
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10
  );


  // 6. Save updated password
  user.password = hashedPassword;
  await user.save();

  return { message: "Password reset successful" };
}