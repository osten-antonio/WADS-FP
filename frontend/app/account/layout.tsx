import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "@/components/ui/sonner"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <AppShell isAuthenticated>
      {children}
      <Toaster position="top-right" richColors closeButton duration={3000} />
    </AppShell>
  )
}
