import { render } from "@testing-library/react"
import { Katex } from "@/components/widget/Katex"

describe("Katex backslash handling", () => {
  it("preserves LaTeX line breaks (\\\\) instead of collapsing them", () => {
    // Source string is: \begin{cases} a \\ b \end{cases}
    // The \\ is a LaTeX line break, creating two rows in the cases environment.
    // Collapsing \\ -> \ produces \begin{cases} a \ b \end{cases} (one row, mangled).
    const { container } = render(
      <Katex expression={"\\begin{cases} a \\\\ b \\end{cases}"} />,
    )
    // No parse errors in either case (katex is lenient with throwOnError:false),
    // but the STRUCTURAL output differs: \\ produces two <mtr> rows, \ produces one.
    const rows = container.querySelectorAll("mtr")
    expect(rows.length).toBe(2)
    expect(container.innerHTML).toContain("katex")
  })

  it("still renders a simple fraction", () => {
    const { container } = render(<Katex expression={"\\frac{a}{b}"} />)
    expect(container.querySelector(".katex-error")).toBeNull()
    expect(container.innerHTML).toContain("katex")
  })
})
