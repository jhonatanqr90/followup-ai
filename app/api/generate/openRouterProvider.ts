import { createOpenAI } from "@ai-sdk/openai";

export const openRouterProvider = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://followup-ai-sigma.vercel.app",
    "X-Title": "followup-ai",
  }
})