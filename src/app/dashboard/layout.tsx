import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { requireAdmin } from "@/lib/auth/session";

import { DashboardNav } from "./dashboard-nav";

export const metadata: Metadata = {
  title: "Painel | Odilon",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Verificação real da sessão (cada página e action também verifica)
  const { email } = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 print:hidden border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="rounded-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Painel
            </Link>

            <div className="flex items-center gap-1 md:hidden">
              <HeaderActions />
            </div>
          </div>

          <DashboardNav />

          <div className="hidden items-center gap-1 md:flex">
            <span className="mr-2 max-w-48 truncate text-sm text-muted-foreground" title={email}>
              {email}
            </span>
            <HeaderActions />
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 print:p-0">
        {children}
      </main>
    </div>
  );
}

function HeaderActions() {
  return (
    <>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/" target="_blank" aria-label="Ver site (abre em nova aba)" title="Ver site">
          <ExternalLink aria-hidden="true" />
        </Link>
      </Button>
      <AnimatedThemeToggler className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4" />
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Sair" title="Sair">
          <LogOut aria-hidden="true" />
        </Button>
      </form>
    </>
  );
}
