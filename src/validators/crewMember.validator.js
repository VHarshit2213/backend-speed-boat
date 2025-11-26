import { z } from "zod";

export const createCrewMemberSchema = z.object({
  speedboat_id: z.string().uuid(),
  name: z.string().min(1),
});

export const updateCrewMemberSchema = createCrewMemberSchema.partial();
