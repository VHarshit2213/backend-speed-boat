import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    const bodyParse = schema.safeParse(req.body);
    if (bodyParse.success) return next();

       // Fallback: validate object with body/params/query (some schemas may expect this)
    schema.parse({ body: req.body, params: req.params, query: req.query });
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', issues: err.issues });
    }
    next(err);
  }
};


