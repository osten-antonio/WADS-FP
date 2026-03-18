import { fireEvent, render, screen } from "@testing-library/react"

import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("Sidebar", () => {
  it("renders the navigation items", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    )

    expect(screen.getByText("Statistics")).toBeInTheDocument()
    expect(screen.getByText("Calculus")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Statistics"))
    expect(screen.getByText("Probability")).toBeInTheDocument()
    expect(screen.getByText("Counting")).toBeInTheDocument()
    expect(screen.getByText("Inference")).toBeInTheDocument()
    expect(screen.getByText("Data")).toBeInTheDocument()
    expect(screen.getByText("Reference")).toBeInTheDocument()
  })
})
