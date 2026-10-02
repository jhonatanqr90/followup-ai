import { streamText, createTextStreamResponse, toTextStream } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const schema = z.object({
  amount: z.number().positive(),
  daysLate: z.number().int().nonnegative(),
  tone: z.enum(["friendly", "firm", "urgent"]),
  language: z.enum(["es", "en"]),
})

export async function POST(req: Request) {
  const body = await req.json()
  const { amount, daysLate, tone, language } = schema.parse(body)

  const toneLabel = { friendly: "friendly", firm: "firm", urgent: "urgent" }[tone]
  const langLabel = { es: "Spanish", en: "English" }[language]

  const prompt = `Write a ${toneLabel} follow-up message for a client who owes $${amount} and is ${daysLate} days late. The message should be professional and ready to send via WhatsApp. Language: ${langLabel}.`

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
  })

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  })
}