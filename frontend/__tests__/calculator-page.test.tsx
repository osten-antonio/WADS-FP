import { render, screen } from "@testing-library/react"

import CalculatorPage from "@/app/app/calculator/page"

describe("Calculator page", () => {
  it("shows the topic header and empty state", () => {
    render(<CalculatorPage />)
    expect(screen.getByText("General")).toBeInTheDocument()
    expect(screen.getByText("Enter a problem to be solved")).toBeInTheDocument()
  })
})
