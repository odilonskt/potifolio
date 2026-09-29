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
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {children}
    </div>
  );
}
