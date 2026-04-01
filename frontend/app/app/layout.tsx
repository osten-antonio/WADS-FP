import { AppShell } from "@/components/layout/AppShell"
import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AppShell isAuthenticated={Boolean(session)}>{children}</AppShell>
   );
}
