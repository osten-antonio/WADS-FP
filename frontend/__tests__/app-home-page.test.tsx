import { render, screen } from "@testing-library/react"

import AppHomePage from "@/app/app/page"

describe("App home page", () => {
  it("renders the home page text", () => {
    render(<AppHomePage />)
    expect(screen.getByText("home page")).toBeInTheDocument()
  })
})
