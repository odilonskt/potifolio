"use client"; // Error boundaries precisam ser Client Components

import "./globals.css";

import { useEffect } from "react";

import { StatusPage } from "@/components/status/status-page";
import { Button } from "@/components/ui/button";

/**
 * Falha no próprio layout raiz. Substitui o documento inteiro, então precisa de
 * <html>/<body> próprios e aplica o tema salvo (o ThemeProvider não roda aqui).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    let theme: string | null = null;
    try {
      theme = localStorage.getItem("theme");
    } catch {
      // Armazenamento bloqueado: segue a preferência do sistema
    }
    const dark =
      theme === "dark" || ((!theme || theme === "system") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [error]);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <title>Erro | Odilon</title>
        <StatusPage
          code={500}
          title="O site está com problemas"
          description="Não foi possível carregar a página. Tente de novo em alguns instantes."
        >
          <Button onClick={() => retry()}>Tentar de novo</Button>
          {/* <a> em vez de <Link>: o roteador pode estar indisponível aqui */}
          <Button asChild variant="outline">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- recarga completa proposital após falha do layout raiz */}
            <a href="/">Ir para o início</a>
          </Button>
          {error.digest && (
            <p className="w-full text-xs text-muted-foreground">
              Código do erro: <code className="font-mono">{error.digest}</code>
            </p>
          )}
        </StatusPage>
      </body>
    </html>
  );
}
