import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/session";

import { DashboardNav } from "./dashboard-nav";

export const metadata: Metadata = {
  title: "Painel | Odilon",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Verificação real da sessão para TODAS as rotas do painel
  await requireAdmin();

  return (
    // Painel sempre no tema escuro (layout interno pensado para ele)
    <div className="dark min-h-screen bg-background text-foreground">
      <DashboardNav />
      {children}
    </div>
  );
}
