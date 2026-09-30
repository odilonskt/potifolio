import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LoginForm } from "@/components/login-form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getSession } from "@/lib/auth/session";
import { localePath } from "@/lib/i18n/config";
import { dashboard } from "@/lib/i18n/messages/dashboard";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: dashboard[await getLocale()].login.metaTitle, robots: { index: false, follow: false } };
}

export default async function LoginPage() {
  const locale = await getLocale();
  const session = await getSession();
  if (session.authenticated) redirect(localePath(locale, "/dashboard"));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href={localePath(locale)}
          className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {dashboard[locale].login.backToSite}
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher className="h-9 px-2.5" />
          <AnimatedThemeToggler className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4" />
        </div>
      </header>

      <main id="conteudo" className="flex flex-1 items-center justify-center px-4 pb-16">
        <LoginForm />
      </main>
    </div>
  );
}
