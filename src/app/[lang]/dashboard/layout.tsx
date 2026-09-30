import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { requireAdmin } from "@/lib/auth/session";
import { localePath, type Locale } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

import { DashboardNav } from "./dashboard-nav";

export async function generateMetadata(): Promise<Metadata> {
  return { title: dashboard[await getLocale()].metaTitle, robots: { index: false, follow: false } };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Verificação real da sessão (cada página e action também verifica)
  const { email } = await requireAdmin();
  const locale = await getLocale();
  const t = dashboard[locale];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 print:hidden border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={localePath(locale, "/dashboard")}
              className="rounded-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t.panel}
            </Link>

            <div className="flex items-center gap-1 md:hidden">
              <HeaderActions locale={locale} />
            </div>
          </div>

          <DashboardNav />

          <div className="hidden items-center gap-1 md:flex">
            <span className="mr-2 max-w-48 truncate text-sm text-muted-foreground" title={email}>
              {email}
            </span>
            <HeaderActions locale={locale} />
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 print:p-0">
        {children}
      </main>
    </div>
  );
}

function HeaderActions({ locale }: { locale: Locale }) {
  const t = dashboard[locale];
  return (
    <>
      <LanguageSwitcher className="h-9 px-2.5" />
      <Button variant="ghost" size="icon" asChild>
        <Link href={localePath(locale)} target="_blank" aria-label={t.seeSite} title={t.seeSiteTitle}>
          <ExternalLink aria-hidden="true" />
        </Link>
      </Button>
      <AnimatedThemeToggler className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4" />
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="icon" aria-label={t.logout} title={t.logout}>
          <LogOut aria-hidden="true" />
        </Button>
      </form>
    </>
  );
}
