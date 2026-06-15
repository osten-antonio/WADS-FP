import { render, screen } from "@testing-library/react"
import { Markdown } from "@/components/widget/Markdown"
import { Katex } from "@/components/widget/Katex"

describe("Markdown", () => {
  it("renders plain text", () => {
    render(<Markdown content="Hello world" />)
    expect(screen.getByText("Hello world")).toBeInTheDocument()
  })

  it("renders bold text", () => {
    const { container } = render(<Markdown content="**bold text**" />)
    expect(screen.getByText("bold text")).toBeInTheDocument()
    expect(container.innerHTML).toContain("bold text")
  })

  it("renders inline LaTeX math", () => {
    const { container } = render(<Markdown content="The value is $x^2$" />)
    expect(screen.getByText("The value is")).toBeInTheDocument()
    expect(container.innerHTML).toContain("katex")
  })

  it("renders single-line $$math$$ as inline KaTeX without leaking literal dollar signs", () => {
    const { container } = render(<Markdown content="$$E = mc^2$$" />)
    expect(container.innerHTML).toContain("katex")
    // The old regex parser leaked stray $ around the math; the pipeline must not.
    expect(container.textContent).not.toContain("$")
  })

  it("renders display math ($$ on its own lines) with the katex-display class", () => {
    const { container } = render(<Markdown content={"$$\nE = mc^2\n$$"} />)
    expect(container.querySelector(".katex-display")).not.toBeNull()
    expect(container.textContent).not.toContain("$")
  })

  it("renders combined markdown and LaTeX", () => {
    const { container } = render(<Markdown content="**Formula:** $f(x) = x^2$" />)
    expect(screen.getByText("Formula:")).toBeInTheDocument()
    expect(container.innerHTML).toContain("katex")
  })

  it("renders inline mode", () => {
    const { container } = render(<Markdown content="$x^2$" inline />)
    expect(container.innerHTML).toContain("katex")
    // inline must not wrap content in a block <p>
    expect(container.querySelector("p")).toBeNull()
  })

  it("handles empty content", () => {
    const { container } = render(<Markdown content="" />)
    expect(container.innerHTML).toBe("<div></div>")
  })

  it("renders a bullet list as <li> elements", () => {
    const { container } = render(<Markdown content={"- alpha\n- beta"} />)
    expect(container.querySelectorAll("li")).toHaveLength(2)
  })
})

describe("Katex", () => {
  it("renders simple LaTeX", () => {
    const { container } = render(<Katex expression="x^2" />)
    expect(container.innerHTML).toContain("katex")
  })

  it("renders fraction", () => {
    const { container } = render(<Katex expression="\\frac{a}{b}" />)
    expect(container.innerHTML).toContain("katex")
  })

  it("renders greek letters", () => {
    const { container } = render(<Katex expression="\\alpha + \\beta" />)
    expect(container.innerHTML).toContain("katex")
  })

  it("renders with custom className", () => {
    const { container } = render(<Katex expression="x^2" className="custom-class" />)
    expect(container.innerHTML).toContain("custom-class")
  })

  it("falls back to raw text on error", () => {
    // Use a JS expression string (curly braces) so \\ = one backslash (an unterminated LaTeX command).
    // JSX unquoted string attributes ("...") treat backslash as a literal, so "invalid\\" would
    // be two backslashes (a valid LaTeX line break), not an error. One backslash triggers katex-error.
    const { container } = render(<Katex expression={"invalid\\"} />)
    expect(container.textContent).toBe("invalid\\")
  })
})