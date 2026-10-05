/**
 * app/api/generate/route.ts
 *
 * ES: Capa de aplicación / handler HTTP.
 * Este archivo es el conductor: recibe la petición, valida los datos, construye
 * el prompt, llama al modelo de IA y devuelve el stream de texto. No contiene
 * lógica de negocio ni configuración del provider; solo orquesta las capas
 * inferiores.
 *
 * EN: Application layer / HTTP handler.
 * This file is the conductor: receives the request, validates data, builds the
 * prompt, calls the AI model, and returns the text stream. It contains no
 * business logic or provider configuration; it only orchestrates the lower
 * layers.
 */

import { streamText, createTextStreamResponse, toTextStream, APICallError } from "ai"
import { openrouter } from "@/lib/ai/openrouter"
import { generateSchema } from "@/lib/validations/generate"
import { buildPrompt } from "@/lib/followup/prompt"

/**
 * ES: Modelo por defecto de OpenRouter para este endpoint.
 * Usamos el router gratuito de OpenRouter, que elige automáticamente un modelo
 * disponible sin costo. Si queremos un modelo específico, cambiamos solo esta
 * constante.
 *
 * EN: Default OpenRouter model for this endpoint.
 * We use OpenRouter's free router, which automatically picks an available free
 * model. If we want a specific model, we only change this constant.
 */
const DEFAULT_MODEL = "openrouter/free"

export async function POST(req: Request) {
  try {
    // ES: Leemos el body crudo. Lo tipamos como unknown porque aún no está validado.
    // EN: Read the raw body. We type it as unknown because it is not validated yet.
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // ES: Validamos con Zod. Si falla, devolvemos 400 con los detalles del error.
    // EN: Validate with Zod. If it fails, return 400 with error details.
    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // ES: Construimos el prompt usando la capa de dominio pura.
    // EN: Build the prompt using the pure domain layer.
    const prompt = buildPrompt(parsed.data)

    // ES: Llamamos al modelo de IA a través del provider de infraestructura.
    // EN: Call the AI model through the infrastructure provider.
    const result = streamText({
      model: openrouter(DEFAULT_MODEL),
      prompt,
    })

    // ES: Convertimos el stream de texto en una respuesta HTTP de streaming.
    // EN: Convert the text stream into an HTTP streaming response.
    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
    })
  } catch (error) {
    // ES: Log interno para debugging. En producción se reemplazaría por un logger estructurado.
    // EN: Internal log for debugging. In production, replace with a structured logger.
    console.error("Error generating message:", error)

    // ES: Si el error viene del provider de IA, devolvemos su mensaje al cliente.
    // EN: If the error comes from the AI provider, return its message to the client.
    if (error instanceof APICallError) {
      return Response.json(
        {
          error: "AI provider error",
          message: error.message,
          code: error.statusCode,
        },
        { status: error.statusCode ?? 502 }
      )
    }

    // ES: Cualquier otro error se trata como error interno del servidor.
    // EN: Any other error is treated as an internal server error.
    return Response.json(
      { error: "Failed to generate message" },
      { status: 500 }
    )
  }
}
