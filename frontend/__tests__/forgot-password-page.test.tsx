import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import ForgotPasswordPage from "@/app/forgot-password/page"
import { sendPasswordResetEmail } from "firebase/auth"
import { FirebaseError } from "firebase/app"

// Fake out Firebase so no real network call happens.
jest.mock("firebase/auth", () => ({
  sendPasswordResetEmail: jest.fn(),
}))
jest.mock("@/lib/firebase-client", () => ({ auth: {} }))

const mockSend = sendPasswordResetEmail as jest.Mock

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mockSend.mockReset()
    mockSend.mockResolvedValue(undefined)
  })

  it("sends a reset email and shows the neutral confirmation", async () => {
    render(<ForgotPasswordPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Email"), "ada@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    // It asked Firebase to email this exact address...
    expect(mockSend).toHaveBeenCalledWith(expect.anything(), "ada@example.com")
    // ...and it showed the message that gives nothing away.
    expect(
      await screen.findByText(/we've sent a password reset link/i)
    ).toBeInTheDocument()
  })

  it("still shows the neutral confirmation when the email is unknown (no enumeration)", async () => {
    mockSend.mockRejectedValue(new FirebaseError("auth/user-not-found", "not found"))

    render(<ForgotPasswordPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Email"), "ghost@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    expect(
      await screen.findByText(/we've sent a password reset link/i)
    ).toBeInTheDocument()
  })
})
