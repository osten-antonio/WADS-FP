"use client"

import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { auth } from "@/lib/firebase-client";
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
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await createSession(idToken);

      router.push("/account");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof FirebaseError ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await result.user.getIdToken();
      await createSession(idToken);

      router.push("/account");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);

      let message = "Login failed";
      const firebaseError = error instanceof FirebaseError ? error : null;

      if (firebaseError?.code === "auth/user-not-found") {
        message = "User not found";
      } else if (firebaseError?.code === "auth/wrong-password") {
        message = "Wrong password";
      } else if (firebaseError?.code === "auth/invalid-email") {
        message = "Invalid email format";
      } else if (firebaseError?.code === "auth/invalid-credential") {
        message = "Invalid email or password";
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
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
                Enter your details below to login to your account
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form id="login-form" onSubmit={handleEmailLogin}>
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
                    <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                        Forgot your password?
                    </a>
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
              <Button className="w-full" type="submit" form="login-form" disabled={loading}>
                  Login
              </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                  Login with Google
              </Button>
            </CardFooter>
        </Card>
        </div>
    )
}
