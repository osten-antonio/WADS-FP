import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FirebaseError } from "firebase/app"

import { ChangePasswordDialog } from "@/components/account/change-password-dialog"
import {
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"

jest.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: jest.fn(() => ({ token: "cred" })) },
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
}))

jest.mock("@/lib/firebase-client", () => ({
  auth: {
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: { email: "ada@example.com" },
  },
}))

const mockReauth = reauthenticateWithCredential as jest.Mock
const mockUpdate = updatePassword as jest.Mock

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  current: string,
  next: string,
  confirm: string
) {
  await user.type(screen.getByLabelText("Current password"), current)
  await user.type(screen.getByLabelText("New password"), next)
  await user.type(screen.getByLabelText("Confirm new password"), confirm)
}

describe("ChangePasswordDialog", () => {
  beforeEach(() => {
    mockReauth.mockReset()
    mockUpdate.mockReset()
    mockReauth.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)
  })

  it("re-authenticates then updates the password on valid input", async () => {
    const onOpenChange = jest.fn()
    render(<ChangePasswordDialog open onOpenChange={onOpenChange} />)
    const user = userEvent.setup()

    await fillForm(user, "oldpass", "brandnew1", "brandnew1")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    expect(mockReauth).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith(expect.anything(), "brandnew1")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("blocks submit and warns when the new passwords do not match", async () => {
    render(<ChangePasswordDialog open onOpenChange={jest.fn()} />)
    const user = userEvent.setup()

    await fillForm(user, "oldpass", "brandnew1", "different1")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    expect(
      await screen.findByText("New passwords do not match.")
    ).toBeInTheDocument()
    expect(mockReauth).not.toHaveBeenCalled()
  })

  it("shows a friendly message when the current password is wrong", async () => {
    mockReauth.mockRejectedValue(
      new FirebaseError("auth/wrong-password", "bad password")
    )
    render(<ChangePasswordDialog open onOpenChange={jest.fn()} />)
    const user = userEvent.setup()

    await fillForm(user, "wrongpass", "brandnew1", "brandnew1")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    expect(
      await screen.findByText("Current password is incorrect.")
    ).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
