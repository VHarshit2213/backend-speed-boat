import { z } from 'zod';

export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    parent: z.string().min(1).nullable().optional(), // allow null for root
  }),
});

export const renameFolderSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ name: z.string().min(1) }),
});
