import { AppShell } from "@/components/layout/AppShell"
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <AppShell isAuthenticated>{children}</AppShell>
}
