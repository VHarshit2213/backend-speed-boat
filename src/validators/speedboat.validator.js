import { z } from "zod";

const kpiSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  baseline: z.number().optional().nullable(),
  target: z.number().optional().nullable(),
  current: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
});

const milestoneSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  due_date: z.string().optional().nullable(),
  status: z.enum(["pending","on-track","at-risk","done"]).optional(),
});

const nextActionSchema = z.object({
  id: z.string().uuid().optional(),
  task: z.string(),
  owner: z.string(),
  due_date: z.string().optional().nullable(),
  status: z.enum(["open","in-progress","done"]).optional(),
});

export const createSpeedboatSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  captain: z.string().optional().nullable(),
  sponsor: z.string().optional().nullable(),
  mentor: z.string().optional().nullable(),
  health: z.enum(["green","yellow","red"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  manual_health_override: z.boolean().optional(),
  crew: z.array(z.string()).optional(),
  kpis: z.array(kpiSchema).optional(),
  milestones: z.array(milestoneSchema).optional(),
  nextActions: z.array(nextActionSchema).optional(),
  reflections: z.array(z.object({
    achievements: z.string().optional().nullable(),
    challenges: z.string().optional().nullable(),
    learnings: z.string().optional().nullable(),
    next_actions: z.string().optional().nullable(),
    needs: z.string().optional().nullable(),
  })).optional(),
  dependencies: z.array(z.string().uuid()).optional()
});

export const updateSpeedboatSchema = createSpeedboatSchema.partial();
