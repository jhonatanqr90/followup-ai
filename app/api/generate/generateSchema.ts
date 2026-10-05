import z from "zod";

export const generateSchema = z.object({
  amount: z.number().positive(),
  daysLate: z.number().int().nonnegative(),
  tone: z.enum(["friendly", "firm", "urgent"]),
  language: z.enum(["es", "en"]),
})