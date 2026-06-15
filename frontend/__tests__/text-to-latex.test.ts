import { textToLatex } from "@/lib/text-to-latex"

describe("textToLatex (raw user input normalizer)", () => {
  it("leaves existing LaTeX untouched", () => {
    expect(textToLatex("\\frac{a}{b}")).toBe("\\frac{a}{b}")
  })

  it("wraps plain prose in \\text and strips dollar amounts", () => {
    const out = textToLatex("The total cost is $80 for the trip")
    expect(out.startsWith("\\text{")).toBe(true)
    expect(out).not.toContain("$")
  })

  it("converts a simple math expression to LaTeX", () => {
    const out = textToLatex("x^2 + 1")
    expect(out).toBe("x^{2} + 1")
  })

  it("braces fractions of two integers", () => {
    expect(textToLatex("3/4")).toContain("\\frac{3}{4}")
  })

  it("returns empty string for empty input", () => {
    expect(textToLatex("")).toBe("")
  })
})
