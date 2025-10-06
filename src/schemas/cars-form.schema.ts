import { z } from "zod";

// Zod schema for CARS form score field
export const scoreFieldSchema = z.object({
  score: z
    .number()
    .min(1, "Score must be at least 1")
    .max(4, "Score must be at most 4")
    .refine((val) => val % 0.5 === 0, "Score must be in 0.5 increments"),
  observations: z.string().optional().default(""),
});

// Zod schema for complete CARS form submission
export const createCARSFormSchema = z.object({
  personalRelationships: scoreFieldSchema,
  imitation: scoreFieldSchema,
  emotionalResponse: scoreFieldSchema,
  bodyUse: scoreFieldSchema,
  objectUse: scoreFieldSchema,
  responseToChange: scoreFieldSchema,
  visualResponse: scoreFieldSchema,
  auditoryResponse: scoreFieldSchema,
  tasteSmelLTouch: scoreFieldSchema,
  fearOrNervousness: scoreFieldSchema,
  verbalCommunication: scoreFieldSchema,
  nonVerbalCommunication: scoreFieldSchema,
  activityLevel: scoreFieldSchema,
  intellectualResponse: scoreFieldSchema,
  generalImpressions: scoreFieldSchema,
});

export type CARSFormInput = z.infer<typeof createCARSFormSchema>;
