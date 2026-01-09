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

export const listUsers = async (req, res) => {
  try {
    const result = await userService.listUsers({
      q: req.query.q,
      page: req.query.page,
      size: req.query.size,
      userId: req.user.id,
    });

    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
