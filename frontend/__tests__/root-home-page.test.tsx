import { render, screen } from "@testing-library/react"

import RootHomePage from "@/app/page"

describe("Root home page", () => {
  it("renders the step box content", () => {
    render(<RootHomePage />)
    expect(screen.getByText("Step 1")).toBeInTheDocument()
    expect(screen.getByText("This is the summary of step 1.")).toBeInTheDocument()
  })
})
