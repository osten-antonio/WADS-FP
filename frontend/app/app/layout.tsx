import { AppShell } from "@/components/layout/AppShell"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell additionalClassName="px-4 py-8">{children}</AppShell>
   );
}
