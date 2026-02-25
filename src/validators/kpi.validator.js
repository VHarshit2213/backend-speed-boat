import { z } from "zod";

export const createKPISchema = z.object({
  speedboat_id: z.string().uuid(),
  name: z.string().min(1),
  baseline: z.number().optional().nullable(),
  target: z.number().optional().nullable(),
  current: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  position: z.number().int().nonnegative().optional(),
  isCompleted: z.boolean().optional(),
});

export const updateKPISchema = createKPISchema.partial();

export const reorderKPISchema = z.object({
  speedboat_id: z.string().uuid(),
  kpi_ids: z.array(z.string().uuid()).min(1),
});
