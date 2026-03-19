"use client"

import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { auth } from "@backend/lib/firebase";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/dist/client/components/navigation"
import { toast } from "sonner"

export default function login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const createSession = async (idToken: string) => {
    const res = await fetch("/api/session", {
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

      toast.success("Login success 🎉");

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await result.user.getIdToken();
      await createSession(idToken);

      toast.success("Login success");

      router.push("/account");
      router.refresh();
    } catch (error: any) {
      console.error(error);

      let message = "Login failed";

      if (error.code === "auth/user-not-found") {
        message = "User not found";
      } else if (error.code === "auth/wrong-password") {
        message = "wrong password";
      } else if (error.code === "auth/invalid-email") {
        message = "invalid email format";
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
            <form>
                <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
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
                    <Input id="password" type="password" required />
                </div>
                </div>
            </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={handleEmailLogin} disabled={loading}>
                  Login
              </Button>
                  <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                  Login with Google
              </Button>
            </CardFooter>
        </Card>
        </div>
    )
}
