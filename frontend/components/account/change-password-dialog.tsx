"use client"

import * as React from "react"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { toast } from "sonner"

import { auth } from "@/lib/firebase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MIN_PASSWORD_LENGTH = 6

// Turn a Firebase error code into a sentence a person understands.
function messageForError(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : ""
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect."
    case "auth/weak-password":
      return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    case "auth/requires-recent-login":
      return "Please log out and back in, then try again."
    default:
      return "Could not change password. Please try again."
  }
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const resetFields = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError(null)
  }

  // When the box closes, wipe what was typed so it isn't sitting there next time.
  const handleOpenChange = (next: boolean) => {
    if (!next) resetFields()
    onOpenChange(next)
  }

  // Checks we can do without calling Firebase. Returns an error sentence, or null if OK.
  const findValidationError = (): string | null => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Please fill in every field."
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (newPassword !== confirmPassword) {
      return "New passwords do not match."
    }
    if (newPassword === currentPassword) {
      return "New password must be different from the current one."
    }
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const validationError = findValidationError()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)

      // Make sure Firebase has finished loading who's logged in.
      await auth.authStateReady()
      const user = auth.currentUser
      if (!user || !user.email) {
        toast.error("Please log in again.")
        handleOpenChange(false)
        return
      }

      // Step 1: prove it's really them using the current password.
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      // Step 2: now we're allowed to set the new password.
      await updatePassword(user, newPassword)
      toast.success("Password updated.")
      handleOpenChange(false)
    } catch (caught: unknown) {
      setError(messageForError(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password, then your new password twice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
