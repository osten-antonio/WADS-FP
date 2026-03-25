import { render, screen } from "@testing-library/react"

import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const mockRouter = {
  push: jest.fn(),
}

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}))

describe("Sidebar", () => {
  beforeEach(() => {
    mockRouter.push.mockReset()
  })

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
