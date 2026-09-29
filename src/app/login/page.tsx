import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entrar | Painel",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session.authenticated) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao site
        </Link>
        <AnimatedThemeToggler className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4" />
      </header>

      <main id="conteudo" className="flex flex-1 items-center justify-center px-4 pb-16">
        <LoginForm />
      </main>
    </div>
  );
}
