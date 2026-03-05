import { render, screen } from "@testing-library/react"

import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

describe("Sidebar", () => {
  it("renders the navigation items", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    )

    expect(screen.getByText("Statistics")).toBeInTheDocument()
    expect(screen.getByText("Calculus")).toBeInTheDocument()
  })
})
