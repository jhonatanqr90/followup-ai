import { describe, it, expect } from "vitest";
import { buildPrompt } from "./prompt";


describe('buildPrompt', () => {

    it('builds a friendly english prompt', () => {
        const result = buildPrompt({
            amount: 1500,
            daysLate: 7,
            tone: 'friendly',
            language: 'en'
        })

        expect(result).toContain('friendly')
        expect(result).toContain('$1500')
        expect(result).toContain('7 days late')
        expect(result).toContain('English')
    })

      it("builds an urgent spanish prompt", () => {
        const result = buildPrompt({
            amount: 500,
            daysLate: 30,
            tone: "urgent",
            language: "es",
        })

        expect(result).toContain("urgent")
        expect(result).toContain("$500")
        expect(result).toContain("30 days late")
        expect(result).toContain("Spanish")
    })

})