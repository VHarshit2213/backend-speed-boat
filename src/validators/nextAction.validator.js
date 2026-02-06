import { z } from "zod";

export const createNextActionSchema = z.object({
  speedboat_id: z.string().uuid(),
  task: z.string().min(1),
  owner: z.string().min(1),
  due_date: z.string().optional().nullable(),
  status: z.enum(["open","in-progress","done"]).optional(),
  position: z.number().int().nonnegative().optional(),
});

export const updateNextActionSchema = createNextActionSchema.partial();

export const reorderNextActionSchema = z.object({
  speedboat_id: z.string().uuid(),
  next_action_ids: z.array(z.string().uuid()).min(1),
});
