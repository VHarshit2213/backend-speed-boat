import { z } from "zod";

export const createNextActionSchema = z.object({
  speedboat_id: z.string().uuid(),
  task: z.string().min(1),
  owner: z.string().min(1),
  due_date: z.string().optional().nullable(),
  status: z.enum(["open","in-progress","done"]).optional(),
});

export const updateNextActionSchema = createNextActionSchema.partial();
