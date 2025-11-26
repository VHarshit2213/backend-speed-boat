import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', issues: err.issues });
    }
    next(err);
  }
};


