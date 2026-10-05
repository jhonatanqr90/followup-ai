import { streamText, createTextStreamResponse, toTextStream, APICallError } from "ai"
import { generateSchema } from "./generateSchema"
import { openRouterProvider } from "./openRouterProvider"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { amount, daysLate, tone, language } = parsed.data
    const toneLabel = { friendly: "friendly", firm: "firm", urgent: "urgent" }[tone]
    const langLabel = { es: "Spanish", en: "English" }[language]

    const prompt = `Write a ${toneLabel} follow-up message for a client who owes $${amount} and is ${daysLate} days late. The message should be professional and ready to send via WhatsApp. Language: ${langLabel}.`

    const result = streamText({
      model: openRouterProvider("openrouter/free"),
      prompt,
      onFinish: (event) => {
        console.log("Model:", event.model)
        console.log("Provider metadata:", event.providerMetadata)
        console.log("Response:", event.response)
      },
    })

    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
    })
  } catch (error) {
    console.error("Error generating message:", error)

    if (error instanceof APICallError) {
      return Response.json(
        {
          error: "AI provider error",
          message: error.message,
          code: error.statusCode,
        },
        { status: error.statusCode ?? 500 }
      )
    }

    return Response.json(
      { error: "Failed to generate message" },
      { status: 500 }
    )
  }
  
}