import { render, screen } from "@testing-library/react"

import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/components/ui/sidebar"

describe("Header", () => {
  it("renders the title and avatar fallback", () => {
    render(
      <SidebarProvider>
        <Header onToggle={() => {}} onLogout={() => {}} onPFPClick={() => {}} />
      </SidebarProvider>
    )

    expect(screen.getAllByText("Calculator")[0]).toBeInTheDocument()
    expect(screen.getByText("Logout")).toBeInTheDocument()
  })
})
