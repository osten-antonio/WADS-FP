"use client"

import { useState } from "react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { toast } from "sonner"

import { auth } from "@/lib/firebase-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Same message whether or not the email exists, so we never reveal
// which emails are registered.
const CONFIRMATION_MESSAGE =
  "If an account exists for that email, we've sent a password reset link."

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (error: unknown) {
      const firebaseError = error instanceof FirebaseError ? error : null

      // Only a bad email format or rate-limit is worth telling the user.
      // Everything else (including "user not found") shows the neutral
      // confirmation so we don't leak who has an account.
      if (firebaseError?.code === "auth/invalid-email") {
        toast.error("Please enter a valid email address.")
        return
      }
      if (firebaseError?.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.")
        return
      }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full bg-scan-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-muted-foreground">{CONFIRMATION_MESSAGE}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Link
            href="/login"
            className="text-sm underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
