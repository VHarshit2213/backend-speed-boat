import * as userService from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getById = async (req, res) => {
  const user = await userService.getUserById(req.params.id,req);
  if (!user) return ApiResponse.error(res, 'User not found', 404);
  return ApiResponse.ok(res, user);
};

export const update = async (req, res) => {
  const files = req.files || {};
  const user = await userService.updateUser(req.user.id, req.body, files, req);
  if (!user) return ApiResponse.error(res, 'User not found', 404);
  return ApiResponse.ok(res, user);
};

export const remove = async (req, res) => {
  const user = await userService.deleteUser(req.params.id);
  if (!user) return ApiResponse.error(res, 'User not found', 404);
  return ApiResponse.ok(res, { deleted: true });
};