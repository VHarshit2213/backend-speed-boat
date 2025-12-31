import { ApiResponse } from "../utils/ApiResponse.js";
import * as kpiService from "../services/kpi.service.js";

export const create = async (req, res) => {
  try {
    const item = await kpiService.createKPI(req.body);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 25, speedboat_id } = req.query;
    const result = await kpiService.listKPIs({ page, limit, speedboat_id }, req.user.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const getById = async (req, res) => {
  try {
    const item = await kpiService.getKPIById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "KPI not found");
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const item = await kpiService.updateKPI(req.params.id, req.body);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    await kpiService.deleteKPI(req.params.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
