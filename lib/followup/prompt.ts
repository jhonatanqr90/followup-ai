/**
 * lib/followup/prompt.ts
 *
 * ES: Capa de dominio / lógica de negocio pura.
 * Esta función construye el prompt que se envía al modelo de IA. Es pura:
 * no tiene efectos secundarios, no depende de frameworks, no hace llamadas de
 * red. Eso la hace muy fácil de testear.
 *
 * EN: Domain layer / pure business logic.
 * This function builds the prompt sent to the AI model. It is pure: no side
 * effects, no framework dependencies, no network calls. That makes it very
 * easy to test.
 */

import type { GenerateInput } from "@/lib/validations/generate"

/**
 * ES: Mapeo de tonos a etiquetas legibles en inglés.
 * Se separa del handler HTTP para que sea fácil de cambiar o testear.
 *
 * EN: Mapping of tones to readable English labels.
 * Separated from the HTTP handler so it is easy to change or test.
 */
const toneLabels = {
  friendly: "friendly",
  firm: "firm",
  urgent: "urgent",
} as const

/**
 * ES: Mapeo de idiomas a etiquetas legibles en inglés.
 *
 * EN: Mapping of languages to readable English labels.
 */
const languageLabels = {
  es: "Spanish",
  en: "English",
} as const

/**
 * ES: Construye el prompt para el modelo de IA.
 *
 * @param input - Datos validados del formulario.
 * @returns El prompt completo como string.
 *
 * EN: Builds the prompt for the AI model.
 *
 * @param input - Validated form data.
 * @returns The complete prompt as a string.
 */
export function buildPrompt(input: GenerateInput): string {
  const tone = toneLabels[input.tone]
  const language = languageLabels[input.language]

  return `Write a ${tone} follow-up message for a client who owes $${input.amount} and is ${input.daysLate} days late. The message should be professional and ready to send via WhatsApp. Language: ${language}.`
}
