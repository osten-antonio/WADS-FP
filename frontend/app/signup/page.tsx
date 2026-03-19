'use client'

import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { auth } from "@/lib/firebase-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const createSession = async (idToken: string) => {
    const res = await fetch("/session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to create session");
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await createSession(idToken);
      
      router.push("/account");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);

      let message = "Sign up failed";
      const firebaseError = error instanceof FirebaseError ? error : null;

      if (firebaseError?.code === "auth/email-already-in-use") {
        message = "Email already in use";
      } else if (firebaseError?.code === "auth/invalid-email") {
        message = "Invalid email format";
      } else if (firebaseError?.code === "auth/weak-password") {
        message = "Password must be at least 6 characters";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-scan-background">
      <Card className="w-full max-w-sm h-1/1.5">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up for an account</CardTitle>
          <CardDescription>
            Enter your details below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form="signup-form" className="w-full" disabled={loading}>
            Sign Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
