import { z } from 'zod';

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    payload: z.any().optional(),
    tags: z.array(z.string()).optional(),
  })
});

export const updateTemplateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    payload: z.any().optional(),
    tags: z.array(z.string()).optional(),
  })
});