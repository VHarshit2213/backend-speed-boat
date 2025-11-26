import { z } from "zod";

export const createMilestoneSchema = z.object({
  speedboat_id: z.string().uuid(),
  title: z.string().min(1),
  due_date: z.string().optional().nullable(),
  status: z.enum(["pending","on-track","at-risk","done"]).optional(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();
