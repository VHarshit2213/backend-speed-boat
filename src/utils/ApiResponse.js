export class ApiResponse {
  static ok(res, data, meta) {
    return res.status(200).json({ success: true, data, meta });
  }

  static created(res, data) {
    return res.status(201).json({ success: true, data });
  }

  static error(res, message, status = 500) {
    return res.status(status).json({ success: false, message });
  }
}
