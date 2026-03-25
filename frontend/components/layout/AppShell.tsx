"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase-client"
import { signOut } from "firebase/auth"
import { toast } from "sonner"

export function AppShell({
  children,
  additionalClassName,
  isAuthenticated = false,
}: {
  children: React.ReactNode;
  additionalClassName?: string;
  isAuthenticated?: boolean;
}) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }

    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear session");
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar />
      <SidebarInset>
        <Header 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout} 
        onProfile={() => router.push('/account')}
        onSignup={() => router.push('/signup')} 
        onLogin={() => router.push('/login')}
        />
        <main className={`flex-1 ${additionalClassName || ''}`}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
