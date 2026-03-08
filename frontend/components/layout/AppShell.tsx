"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

export function AppShell({ children, additionalClassName }: { children: React.ReactNode; additionalClassName?: string }) {
  const router = useRouter()
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar />
      <SidebarInset>
        <Header 
        onToggle={() => {}} 
        onLogout={() => {}} 
        onPFPClick={() => router.push('/account')} />
        <main className={`flex-1 ${additionalClassName || ''}`}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
