"use client"

import * as React from "react"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ children, additionalClassName }: { children: React.ReactNode; additionalClassName?: string }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar />
      <SidebarInset>
        <Header onToggle={() => {}} onLogout={() => {}} onPFPClick={() => {}} />
        <main className={`flex-1 ${additionalClassName || ''}`}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
