import { Op } from "sequelize";
import models from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/mailer.js";
import { otpTemplate} from "../utils/emailTemplates.js";

const { User, Otp} = models;
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// JWT helper
const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "28d",
  });

//  Register
export async function register({ fullName, email, mobile, password, role }) {
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
      role: role || "user",
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

  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // --- OTP GENERATION LOGIC ---
    const code = generateOtp();
    const expiresAt = new Date(new Date().getTime() + 10 * 60000); // 10 mins

    await Otp.create({
      userId: user.id,
      code,
      type: 'reset_password',
      expiresAt
    });

  console.log("Sending OTP for password reset email to:", user.email);
  const result = await sendMail({
    to: user.email,
    subject: "OTP for speedBoat password reset",
    html: otpTemplate(user.fullName, code),
  });


  return { message: "Password reset code sent to your email" };
}

// Reset password
export async function resetPassword({ userId, newPassword }) {
  if (!userId) {
    const err = new Error("userId is required");
    err.status = 400;
    throw err;
  }

  if(!newPassword) {
    const err = new Error("newPassword is required");
    err.status = 400;
    throw err;
  }

  const user = await User.findByPk(userId);
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


export async function verifyOTP({ email, code }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) return { message: "User already verified" };

  const validOtp = await Otp.findOne({
    where: { userId: user.id, code, type: 'reset_password' }
  });

  if (!validOtp) throw new Error("Invalid OTP");
  if (new Date() > validOtp.expiresAt) throw new Error("OTP expired");

   // Clean up OTP
  await validOtp.destroy();

   return {
    user: {
      userId: user.id,
      OtpVerified: true
    }
  };
}