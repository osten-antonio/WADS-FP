import { render, screen } from "@testing-library/react"

import LoginPage from "@/app/login/page"

// The login page pulls in Firebase + the router; fake them all out.
jest.mock("firebase/auth", () => ({
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}))
jest.mock("@/lib/firebase-client", () => ({ auth: {} }))
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

describe("LoginPage", () => {
  it("links 'Forgot your password?' to /forgot-password", () => {
    render(<LoginPage />)
    const link = screen.getByRole("link", { name: /forgot your password/i })
    expect(link).toHaveAttribute("href", "/forgot-password")
  })
})
