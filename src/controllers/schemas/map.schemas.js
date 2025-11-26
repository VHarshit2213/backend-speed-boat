import { z } from 'zod';

export const createMapSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    folder: z.string().min(1).nullable().optional(), // <— allow specifying folder
  }).passthrough(),
});

export const updateMapSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    folder: z.string().min(1).nullable().optional(),
  }).passthrough(),
});
