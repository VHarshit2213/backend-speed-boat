import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().optional(),
    teamMembers: z.array(z.string().regex(uuidRegex, 'Invalid team member ID')).optional(),
    reps: z.array(z.string().regex(uuidRegex, 'Invalid rep ID')).optional(),
    notes: z.string().optional(),
    mapIds: z.array(z.string().regex(uuidRegex, 'Invalid map ID')).optional(),
  })
});

export const updateEventSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    teamMembers: z.array(z.string().regex(uuidRegex, 'Invalid team member ID')).optional(),
    reps: z.array(z.string().regex(uuidRegex, 'Invalid rep ID')).optional(),
    notes: z.string().optional(),
    mapIds: z.array(z.string().regex(uuidRegex, 'Invalid map ID')).optional(),
  })
});