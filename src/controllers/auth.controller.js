import { z } from "zod";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as authService from "../services/auth.service.js";

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    mobile: z.string().min(8),
    password: z.string().min(8),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

// Register controller
export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.ok(res, result);
  } catch (err) {
    console.error("error while login:", err)
    return ApiResponse.error(res, err.message);
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);
    return ApiResponse.ok(res, result);
  } catch (err) {
    console.error("Error in forgotPassword controller:", err);
    return ApiResponse.error(res, err.message || "Failed to send reset link");
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    return ApiResponse.ok(res, result);
  } catch (err) {
    console.error("Error in resetPassword controller:", err);
    return ApiResponse.error(res, err.message || "Failed to reset password");
  }
};