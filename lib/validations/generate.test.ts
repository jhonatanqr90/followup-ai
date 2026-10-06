import { describe, it, expect } from "vitest"
import { generateSchema } from "./generate"

describe("generateSchema", () => {
    it("accepts valid input", () => {
        const result = generateSchema.safeParse({
            amount: 100,
            daysLate: 5,
            tone: "firm",
            language: "es",
        })

        expect(result.success).toBe(true)
    })

    it("rejects negative amount", () => {
        const result = generateSchema.safeParse({
            amount: -10,
            daysLate: 5,
            tone: "firm",
            language: "es",
        })

        expect(result.success).toBe(false)
    })
})