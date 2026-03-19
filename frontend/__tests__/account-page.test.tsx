import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import AccountPage from "@/app/account/page"

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
}

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}))

const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe("AccountPage", () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockRouter.push.mockReset()
    mockRouter.refresh.mockReset()

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
