
export const requireRole = (...roles) => (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  } catch (e) {
    next(e);
  }
};
