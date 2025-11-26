// Simple pagination helper: ?page=1&limit=10  -> { page, limit, skip }
export function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page ?? '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit ?? '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
