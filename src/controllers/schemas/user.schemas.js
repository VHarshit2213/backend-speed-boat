import { z } from 'zod';

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    mobile: z.string().min(8).optional(),
    // email and password are intentionally omitted
  })
});