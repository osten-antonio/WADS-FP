import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/components/ui/sidebar"

describe("Header", () => {
  it("shows Login and Sign Up when unauthenticated", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <Header
          isAuthenticated={false}
          onLogout={() => {}}
          onProfile={() => {}}
          onSignup={() => {}}
          onLogin={() => {}}
        />
      </SidebarProvider>
    )

    expect(screen.getAllByText("Calculator")[0]).toBeInTheDocument()
    await user.click(screen.getByLabelText("Open account menu"))
    expect(screen.getByText("Login")).toBeInTheDocument()
    expect(screen.getByText("Sign Up")).toBeInTheDocument()
  })

  it("shows Profile and Logout when authenticated", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <Header
          isAuthenticated
          onLogout={() => {}}
          onProfile={() => {}}
          onSignup={() => {}}
          onLogin={() => {}}
        />
      </SidebarProvider>
    )

    await user.click(screen.getByLabelText("Open account menu"))
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Logout")).toBeInTheDocument()
  })
})
