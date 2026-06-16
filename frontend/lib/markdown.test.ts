import { markdownToHtml } from "@/lib/markdown"

describe("markdownToHtml", () => {
  it("renders bold", () => {
    expect(markdownToHtml("**bold**")).toContain("<strong>bold</strong>")
  })

  it("renders bullet lists", () => {
    const html = markdownToHtml("- one\n- two")
    expect(html).toContain("<li>one</li>")
    expect(html).toContain("<li>two</li>")
  })

  it("renders inline math as KaTeX", () => {
    expect(markdownToHtml("value $x^2$ here")).toContain("katex")
  })

  it("renders block math as display KaTeX with no leaked dollar signs", () => {
    // remark-math v6 requires $$ on its own line to parse as block (display) math.
    // "$$E = mc^2$$" on a single line is parsed as inlineMath, not mathBlock.
    // Use the correct block-math syntax: $$ delimiter on a separate line.
    const html = markdownToHtml("$$\nE = mc^2\n$$")
    expect(html).toContain("katex-display")
    expect(html).not.toContain("$")
  })

  it("renders display math written with \\[ \\] delimiters", () => {
    // Before normalization the \[ \] block rendered as raw text (no katex);
    // KaTeX keeps the TeX source in a MathML <annotation>, so assert on the
    // rendered markup and the consumed delimiter, not the absence of \frac.
    const html = markdownToHtml("in the form \\[\\frac{A}{x+3} + \\frac{B}{x-3}\\] where")
    expect(html).toContain("katex")
    expect(html).toContain("mfrac")
    expect(html).not.toContain("\\[")
  })

  it("renders inline math written with \\( \\) delimiters", () => {
    const html = markdownToHtml("value \\(x^2\\) here")
    expect(html).toContain("katex")
    expect(html).not.toContain("\\(")
  })

  it("does not split a LaTeX line break like \\\\[0.8ex] as a math delimiter", () => {
    // The doubled backslash is a LaTeX line break inside math, not a \[ delimiter;
    // it must stay inside the rendered math rather than starting a new $$ block.
    const html = markdownToHtml("$$a \\\\[0.8ex] b$$")
    expect(html).toContain("katex")
  })

  it("renders fenced code blocks", () => {
    const html = markdownToHtml("```\ncode line\n```")
    expect(html).toContain("<code>")
    expect(html).toContain("code line")
  })

  it("does not execute raw HTML in the source (XSS-safe)", () => {
    const html = markdownToHtml("<script>alert(1)</script>")
    expect(html).not.toContain("<script>")
  })

  it("unwraps the enclosing paragraph in inline mode", () => {
    const html = markdownToHtml("hello **world**", true)
    expect(html.startsWith("<p>")).toBe(false)
    expect(html).toContain("<strong>world</strong>")
  })

  it("leaves multi-paragraph content untouched in inline mode (no mis-strip)", () => {
    const block = markdownToHtml("First para.\n\nSecond para.")
    const inline = markdownToHtml("First para.\n\nSecond para.", true)
    // A greedy unwrap would mis-strip the outer tags and leave unbalanced markup.
    // Multiple paragraphs must be returned exactly as the block render produces them.
    expect(inline).toBe(block)
  })

  it("handles empty input", () => {
    expect(markdownToHtml("")).toBe("")
  })
})
