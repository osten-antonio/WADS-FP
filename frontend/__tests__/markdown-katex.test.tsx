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

  it("renders block LaTeX math", () => {
    const { container } = render(<Markdown content="$$E = mc^2$$" />)
    expect(container.innerHTML).toContain("katex")
  })

  it("renders combined markdown and LaTeX", () => {
    const { container } = render(<Markdown content="**Formula:** $f(x) = x^2$" />)
    expect(screen.getByText("Formula:")).toBeInTheDocument()
    expect(container.innerHTML).toContain("katex")
  })

  it("renders inline mode", () => {
    const { container } = render(<Markdown content="$x^2$" inline />)
    expect(container.innerHTML).toContain("katex")
  })

  it("handles empty content", () => {
    const { container } = render(<Markdown content="" />)
    expect(container.innerHTML).toBe("<div></div>")
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
    const { container } = render(<Katex expression="invalid\\" />)
    expect(container.textContent).toBe("invalid\\")
  })
})