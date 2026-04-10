import { z } from "zod";

export const entrySchema = z.object({
  exerciseTemplateId: z.string().min(1),
  weight: z.number().min(0).nullable(),
  reps: z.number().min(0).nullable()
});
