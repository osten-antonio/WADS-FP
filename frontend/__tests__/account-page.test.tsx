import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import AccountPage from "@/app/account/page"
import { auth } from "@/lib/firebase-client"

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
}

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}))

jest.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
}))

jest.mock("@/lib/firebase-client", () => ({
  auth: {
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: {
      email: "ada@example.com",
      providerData: [{ providerId: "password" }],
    },
  },
}))

const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe("AccountPage", () => {
  // The mock above gives a stable object we can tweak per test.
  const mockedAuth = auth as unknown as {
    currentUser: { email: string; providerData: { providerId: string }[] } | null
  }

  beforeEach(() => {
    mockFetch.mockReset()
    mockRouter.push.mockReset()
    mockRouter.refresh.mockReset()
    mockedAuth.currentUser = {
      email: "ada@example.com",
      providerData: [{ providerId: "password" }],
    }

    mockFetch.mockImplementation(async (_input, init) => {
      if (init?.method === "PATCH") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            user: {
              firebaseUID: "uid_1",
              displayName: "Ada Lovelace",
            },
            history: [],
          }),
        }
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            firebaseUID: "uid_1",
            displayName: "Pedro Paskal",
          },
          history: [],
        }),
      }
    })
  })

  it("opens the change-password dialog when Change Password is clicked", async () => {
    render(<AccountPage />)
    await screen.findAllByText("Pedro Paskal")

    const user = userEvent.setup()
    const buttons = screen.getAllByRole("button", { name: /change password/i })
    await user.click(buttons[0])

    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("hides Change Password for Google-only accounts", async () => {
    mockedAuth.currentUser = {
      email: "ada@example.com",
      providerData: [{ providerId: "google.com" }],
    }

    render(<AccountPage />)
    await screen.findAllByText("Pedro Paskal")

    expect(await screen.findAllByText(/you sign in with google/i)).not.toHaveLength(0)
    expect(
      screen.queryByRole("button", { name: /change password/i })
    ).not.toBeInTheDocument()
  })

  it("allows editing the displayed name", async () => {
    render(<AccountPage />)

    await screen.findAllByText("Pedro Paskal")

    const user = userEvent.setup()
    const editButtons = screen.getAllByLabelText("Edit name")
    await user.click(editButtons[0])

    const inputs = screen.getAllByRole("textbox")
    await user.clear(inputs[0])
    await user.type(inputs[0], "Ada Lovelace{enter}")

    const updatedNames = await screen.findAllByText("Ada Lovelace")
    expect(updatedNames.length).toBeGreaterThan(0)
  })
})
