/**
 * lib/ai/openrouter.ts
 *
 * ES: Capa de infraestructura de IA.
 * Configura el provider de OpenRouter usando el SDK compatible con OpenAI de
 * Vercel. Este archivo es el único lugar donde leemos la API key y definimos
 * la URL base. Si en el futuro cambiamos a Google, OpenAI u otro provider,
 * solo tocamos aquí.
 *
 * EN: AI infrastructure layer.
 * Configures the OpenRouter provider using Vercel's OpenAI-compatible SDK.
 * This file is the only place where we read the API key and define the base
 * URL. If we ever switch to Google, OpenAI, or another provider, we only
 * change it here.
 */

import { createOpenAI } from "@ai-sdk/openai"

/**
 * ES: Instancia del provider de OpenRouter.
 * - baseURL: endpoint de OpenRouter.
 * - apiKey: clave de API desde variables de entorno.
 * - headers: OpenRouter pide HTTP-Referer y X-Title para estadísticas y rate limits.
 *
 * EN: OpenRouter provider instance.
 * - baseURL: OpenRouter endpoint.
 * - apiKey: API key from environment variables.
 * - headers: OpenRouter asks for HTTP-Referer and X-Title for analytics and rate limits.
 */
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://followup-ai-sigma.vercel.app",
    "X-Title": "followup-ai",
  },
})
