/**
 * lib/validations/generate.ts
 *
 * ES: Capa de validación del feature "generate".
 * Contiene el schema Zod que define qué datos acepta la API y el tipo TypeScript
 * derivado de ese schema. Separar la validación permite reutilizarla en el
 * cliente, en la API y en los tests sin depender de Next.js ni de la IA.
 *
 * EN: Validation layer for the "generate" feature.
 * Contains the Zod schema that defines what data the API accepts and the
 * TypeScript type derived from it. Separating validation lets us reuse it in
 * the client, the API, and tests without depending on Next.js or AI.
 */

import { z } from "zod"

/**
 * ES: Schema de entrada para generar un mensaje de seguimiento.
 * - amount: monto adeudado, debe ser número positivo.
 * - daysLate: días de retraso, entero no negativo.
 * - tone: tono del mensaje (amable, firme, urgente).
 * - language: idioma del mensaje (español o inglés).
 *
 * EN: Input schema for generating a follow-up message.
 * - amount: owed amount, must be a positive number.
 * - daysLate: days overdue, non-negative integer.
 * - tone: message tone (friendly, firm, urgent).
 * - language: message language (Spanish or English).
 */
export const generateSchema = z.object({
  amount: z.number().positive(),
  daysLate: z.number().int().nonnegative(),
  tone: z.enum(["friendly", "firm", "urgent"]),
  language: z.enum(["es", "en"]),
})

/**
 * ES: Tipo TypeScript inferido del schema. Se exporta para que la API, el
 * dominio y el cliente compartan la misma definición de datos.
 *
 * EN: TypeScript type inferred from the schema. Exported so the API, domain,
 * and client share the same data definition.
 */
export type GenerateInput = z.infer<typeof generateSchema>
