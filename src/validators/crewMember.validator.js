import { z } from "zod";

export const createCrewMemberSchema = z.object({
  speedboat_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
});

export const updateCrewMemberSchema = createCrewMemberSchema.partial();
