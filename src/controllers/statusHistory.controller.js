import { ApiResponse } from "../utils/ApiResponse.js";
import * as statusService from "../services/statusHistory.service.js";

export const create = async (req, res) => {
  try {
    const data = await statusService.createStatusNote(
      req.params.id,
      req.body,
      req.user?.id // if using auth
    );

    return ApiResponse.created(res, data);

  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const getDetails = async (req, res) => {
  try {
    const data = await statusService.getStatusDetails(req.params.id);
    return ApiResponse.ok(res, data);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
