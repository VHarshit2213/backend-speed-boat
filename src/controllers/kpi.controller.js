import { ApiResponse } from "../utils/ApiResponse.js";
import * as kpiService from "../services/kpi.service.js";

export const create = async (req, res) => {
  try {
    const item = await kpiService.createKPI(req.body, req.user.id);
    return ApiResponse.created(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, size = 25, speedboat_id } = req.query;
    const result = await kpiService.listKPIs({ page, size, speedboat_id }, req.user.id);
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
    await kpiService.deleteKPI(req.params.id, req.user.id);
    return ApiResponse.ok(res);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const reorder = async (req, res) => {
  try {
    const { speedboat_id, kpi_ids } = req.body;
    const items = await kpiService.reorderKPIs(speedboat_id, kpi_ids);
    return ApiResponse.ok(res, { items });
  } catch (err) {
    return ApiResponse.error(res, err.message, err.status || 500);
  }
};


export const deletedKPIList = async (req, res) => {
  try {
    const { page = 1, size = 25, speedboat_id } = req.query;
    const result = await kpiService.deletedListKPIs({ page, size, speedboat_id }, req.user.id);
    return ApiResponse.ok(res, result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

export const restore = async (req, res) => {
  try {
    const item = await kpiService.restoreKPIs(req.params.id, req.user.id);
    return ApiResponse.ok(res, item);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};
