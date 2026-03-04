'use client'
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <Sidebar />
        <SidebarInset>
          <Header onToggle={() => {}} onLogout={() => {}} onPFPClick={() => {}} />
          <main className="flex-1 px-4 py-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
   );
}