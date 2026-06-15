"use client"

import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

    const handleGoogleRegister = async () => {
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
            const message = error instanceof FirebaseError ? error.message : "Registration failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            const result = await createUserWithEmailAndPassword(auth, email, password);

            const idToken = await result.user.getIdToken();
            await createSession(idToken);

            router.push("/account");
            router.refresh();
        } catch (error: unknown) {
            console.error(error);

            let message = "Registration failed";
            const firebaseError = error instanceof FirebaseError ? error : null;

            if (firebaseError?.code === "auth/email-already-in-use") {
                message = "Email already in use";
            } else if (firebaseError?.code === "auth/invalid-email") {
                message = "Invalid email format";
            } else if (firebaseError?.code === "auth/weak-password") {
                message = "Password is too weak";
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription className="text-primary-dark/70">
                Enter your details below to create a new account
            </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
            <form id="register-form" onSubmit={handleEmailRegister}>
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
                    <Label htmlFor="password" className="text-primary-dark">Password</Label>
                    <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    className="bg-text-input/30 border-primary-main/30 focus:border-button-main focus:ring-button-main/20"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-primary-dark">Confirm Password</Label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={6}
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
                form="register-form" 
                disabled={loading}
              >
                  {loading ? "Creating..." : "Create Account"}
              </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-primary-main/30 text-primary-dark hover:bg-primary-main/10" 
                    onClick={handleGoogleRegister} 
                    disabled={loading}
                  >
                  Register with Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link href="/login" className="underline hover:text-button-main text-button-main">Login</Link>
              </p>
            </CardFooter>
        </Card>
        </div>
    )
}