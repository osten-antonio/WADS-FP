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
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
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
        <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-sm bg-white border-primary-main/20 shadow-lg">
            <CardHeader className="text-primary-dark/80 rounded-t-lg m-0">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription className="text-primary-dark/70">
                Enter your details below to login to your account
            </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
            <form id="login-form" onSubmit={handleEmailLogin}>
                <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-primary-dark">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="bg-text-input/30 border-primary-main/30 focus:border-button-main focus:ring-button-main/20"
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-primary-dark">Password</Label>
                    <Link
                        href="/forgot-password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-button-main"
                    >
                        Forgot your password?
                    </Link>
                    </div>
                    <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="bg-text-input/30 border-primary-main/30 focus:border-button-main focus:ring-button-main/20"
                    />
                </div>
                </div>
            </form>
            </CardContent>
            <CardFooter className="flex-col gap-2 pt-0 pb-6">
              <Button 
                className="w-full bg-button-main hover:bg-button-main/80 text-white" 
                type="submit" 
                form="login-form" 
                disabled={loading}
              >
                  {loading ? "Logging in..." : "Login"}
              </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-primary-main/30 text-primary-dark hover:bg-primary-main/10" 
                    onClick={handleGoogleLogin} 
                    disabled={loading}
                  >
                  Login with Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account? <Link href="/signup" className="underline hover:text-button-main text-button-main">Create one</Link>
              </p>
            </CardFooter>
        </Card>
        </div>
    )
}