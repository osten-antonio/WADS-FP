import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "@/components/ui/sonner"
import { redirect } from "next/navigation";
import { getSession } from "@backend/lib/auth";

export default async function loginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();
  if (session) redirect("/account");
  return (
    <AppShell>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={3000} 
      />
    </AppShell>
  )
}